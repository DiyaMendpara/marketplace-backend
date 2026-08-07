import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(
    query: QueryProductsDto,
  ): Promise<{ data: ProductDocument[]; total: number; page: number; limit: number }> {
    const {
      search,
      category,
      fabricType,
      supplier,
      featured,
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, unknown> = { is_deleted: { $ne: true } };

    if (category) {
      filter.category = category;
    }

    if (fabricType) {
      filter.fabricType = fabricType;
    }

    if (supplier) {
      if (Types.ObjectId.isValid(supplier)) {
        filter.$or = [
          { supplier: new Types.ObjectId(supplier) },
          { supplier: supplier },
        ];
      } else {
        filter.supplier = supplier;
      }
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    if (search) {
      const searchOr = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
      if (filter.$or) {
        const supplierOr = filter.$or;
        delete filter.$or;
        filter.$and = [{ $or: supplierOr }, { $or: searchOr }];
      } else {
        filter.$or = searchOr;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ProductDocument | null> {
    return this.productModel
      .findOne({ _id: id, is_deleted: { $ne: true } })
      .exec();
  }

  async create(
    dto: CreateProductDto,
    supplierId: string,
  ): Promise<ProductDocument> {
    const productData = {
      ...dto,
      description: dto.description || '',
      swatch: dto.swatch || '#c7d2fe',
      supplier: supplierId,
    };
    const product = await this.productModel.create(productData);

    // Notify subscribed buyers of the new fabric
    this.notificationsService.notifySubscribedBuyers(
      `New Fabric: ${product.name}`,
      `A new ${product.fabricType} fabric (${product.name}) has been listed in ${product.category}.`,
      `/product/${product._id}`,
    ).catch(() => {});

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductDocument | null> {
    const existing = await this.productModel.findById(id).exec();

    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (existing && updated && existing.stock === 0 && updated.stock > 0) {
      // Restock trigger: product was out of stock and is now available!
      this.notificationsService.notifySubscribedBuyers(
        `Back in Stock: ${updated.name}`,
        `${updated.name} is back in stock with ${updated.stock}m available!`,
        `/product/${updated._id}`,
      ).catch(() => {});
    }

    return updated;
  }

  async remove(id: string): Promise<ProductDocument | null> {
    return this.productModel
      .findByIdAndUpdate(id, { is_deleted: true }, { new: true })
      .exec();
  }
}
