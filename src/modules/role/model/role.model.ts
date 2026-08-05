import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  @ApiProperty({ type: String, example: 'supplier' })
  name: string;

  @Prop()
  @ApiProperty({ type: String, required: false })
  description?: string;

  @Prop([String])
  @ApiProperty({ type: [String], example: ['product.view', 'product.create'] })
  permissions: string[];

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  created_by?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updated_by?: mongoose.Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
