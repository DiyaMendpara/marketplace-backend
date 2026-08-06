import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  fabricType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  pricePerMeter: number;

  @Prop({ required: true })
  moq: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ type: [{ name: String, hex: String, image: String }], default: [] })
  colors: { name: string; hex: string; image?: string }[];

  @Prop({ required: true })
  swatch: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  supplier: Types.ObjectId;

  @Prop({ default: false })
  featured?: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
