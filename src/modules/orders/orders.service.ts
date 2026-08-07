import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../user/model/user.model';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

function formatOrder<T extends { _id?: unknown }>(order: T) {
  const { _id, ...rest } = order;
  return _id ? { ...rest, id: String(_id) } : rest;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orders: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly products: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly users: Model<UserDocument>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(buyerId: string, input: CreateOrderDto) {
    if (!input.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    const productIds = input.items.map((i) => i.productId);
    const found = await this.products.find({ _id: { $in: productIds } });

    if (found.length !== productIds.length) {
      throw new BadRequestException('A product is unavailable');
    }

    const items = input.items.map((line) => {
      const product = found.find((p) => p.id === line.productId)!;

      if (line.qty < product.moq || line.qty > product.stock) {
        throw new BadRequestException(
          `Quantity for ${product.name} is invalid`,
        );
      }

      return {
        productId: product._id,
        name: product.name,
        supplier: product.supplier?.toString() ?? '',
        qty: line.qty,
        unitPrice: product.pricePerMeter,
        subtotal: product.pricePerMeter * line.qty,
      };
    });

    // Decrement stock for each ordered item
    await Promise.all(
      items.map((item) =>
        this.products.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty },
        }),
      ),
    );

    // Collect unique supplier ObjectIds directly from product.supplier
    const uniqueSupplierIds = [
      ...new Set(
        found
          .map((p) => p.supplier?.toString())
          .filter((id): id is string => !!id),
      ),
    ].map((id) => new Types.ObjectId(id));

    const reference = `ORD-${Date.now().toString().slice(-8)}`;

    const order = await this.orders.create({
      reference,
      buyerId: new Types.ObjectId(buyerId),
      supplierIds: uniqueSupplierIds,
      items,
      shipping: input.shipping,
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
    });

    // Notify suppliers
    await Promise.all(
      uniqueSupplierIds.map((supplierId) =>
        this.notifications.create(
          supplierId,
          'New order received',
          `${reference} is ready for review.`,
          `/supplier/orders/${order.id}`,
        ),
      ),
    );

    // Notify buyer
    await this.notifications.create(
      new Types.ObjectId(buyerId),
      'Order placed',
      `${reference} was sent to the supplier.`,
      `/buyer/orders/${order.id}`,
    );

    return formatOrder(order.toObject());
  }

  async list(userId: string, role: string) {
    let query;

    if (role === 'admin' || role === 'super admin') {
      query = this.orders.find();
    } else if (role === 'supplier') {
      query = this.orders.find({ supplierIds: new Types.ObjectId(userId) });
    } else {
      query = this.orders.find({ buyerId: new Types.ObjectId(userId) });
    }

    const results = await query.sort({ createdAt: -1 }).lean();
    return results.map(formatOrder);
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.orders.findById(id).lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Admin / super admin can see any order
    if (role !== 'admin' && role !== 'super admin') {
      const isBuyer = order.buyerId && String(order.buyerId) === String(userId);
      const isSupplier = Array.isArray(order.supplierIds) && order.supplierIds.some(
        (v) => v && String(v) === String(userId),
      );

      if (!isBuyer && !isSupplier) {
        throw new ForbiddenException();
      }
    }

    return formatOrder(order);
  }

  async updateStatus(id: string, supplierId: string, status: OrderStatus) {
    const order = await this.orders.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isSupplierOfOrder = Array.isArray(order.supplierIds) && order.supplierIds.some(
      (v) => v && String(v) === String(supplierId)
    );
    if (!isSupplierOfOrder) {
      throw new ForbiddenException();
    }

    if (order.status === 'Cancelled' || order.status === 'Completed') {
      throw new BadRequestException('Order is closed');
    }

    order.status = status;
    await order.save();

    await this.notifications.create(
      order.buyerId,
      'Order status updated',
      `${order.reference} is now ${status}.`,
      `/buyer/orders/${order.id}`,
    );

    return formatOrder(order.toObject());
  }

  async cancel(id: string, buyerId: string) {
    const order = await this.orders.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId && String(order.buyerId) !== String(buyerId)) {
      throw new ForbiddenException();
    }

    if (!['Pending', 'Accepted', 'Preparing'].includes(order.status)) {
      throw new BadRequestException(
        'Orders cannot be cancelled after dispatch begins',
      );
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock
    await Promise.all(
      order.items.map((item) =>
        this.products.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty },
        }),
      ),
    );

    // Notify suppliers
    await Promise.all(
      order.supplierIds.map((supplierId) =>
        this.notifications.create(
          supplierId,
          'Order cancelled',
          `${order.reference} was cancelled by the buyer.`,
          `/supplier/orders/${order.id}`,
        ),
      ),
    );

    return formatOrder(order.toObject());
  }

  async invoice(id: string, userId: string) {
    const order = await this.orders.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isBuyer = order.buyerId && String(order.buyerId) === String(userId);
    const isSupplier = Array.isArray(order.supplierIds) && order.supplierIds.some(
      (v) => v && String(v) === String(userId)
    );

    if (!isBuyer && !isSupplier) {
      throw new ForbiddenException();
    }

    return order;
  }
}
