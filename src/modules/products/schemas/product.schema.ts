import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop()
  image?: string;

  @Prop({ required: true })
  supplier: string;

  @Prop({ default: false })
  featured?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
