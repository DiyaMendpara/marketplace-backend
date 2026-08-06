import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Dispatch'
  | 'Completed'
  | 'Cancelled';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  supplierIds: Types.ObjectId[];

  @Prop({
    type: [
      {
        productId: Types.ObjectId,
        name: String,
        supplier: String,
        qty: Number,
        unitPrice: Number,
        subtotal: Number,
      },
    ],
    required: true,
  })
  items: {
    productId: Types.ObjectId;
    name: string;
    supplier: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }[];

  @Prop({
    enum: [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready for Dispatch',
      'Completed',
      'Cancelled',
    ],
    default: 'Pending',
  })
  status: OrderStatus;

  @Prop({ required: true })
  total: number;

  @Prop({ type: Object })
  shipping: Record<string, string>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
