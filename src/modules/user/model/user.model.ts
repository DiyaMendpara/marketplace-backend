import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// The resolved role NAME (from the Role collection) used in API responses,
// req.user, and the frontend. The stored `role` field is an ObjectId ref.
export type UserRole = 'buyer' | 'supplier' | 'admin' | 'super admin';
export type UserStatus = 'active' | 'inactive';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  @ApiProperty({ type: String, example: 'Jane Doe' })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  @ApiProperty({ type: String, example: 'jane@nova.com' })
  email: string;

  // Optional: Google (OAuth) accounts have no password.
  @Prop({ required: false, select: false })
  @ApiProperty({ type: String, required: false, example: 'secret123' })
  password?: string;

  @Prop({ trim: true })
  @ApiProperty({ type: String, required: false })
  googleId?: string;

  @Prop({ enum: ['local', 'google'], default: 'local' })
  @ApiProperty({ enum: ['local', 'google'], default: 'local' })
  authProvider?: 'local' | 'google';

  // References a Role document; permissions come from that role.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  @ApiProperty({ type: String, description: 'Role ObjectId' })
  role: mongoose.Types.ObjectId;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  @ApiProperty({ enum: ['active', 'inactive'], default: 'active' })
  status: UserStatus;

  @Prop({ default: false })
  is_disabled: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: 0 })
  tokenVersion: number;

  @Prop({ default: false })
  isSystemGenerated: boolean;

  @Prop({ trim: true })
  @ApiProperty({ type: String, required: false, example: 'Nova Apparel Ltd.' })
  companyName?: string;

  @Prop({ trim: true })
  @ApiProperty({ type: String, required: false, example: '+1 555 0100' })
  phone?: string;

  @Prop({ trim: true })
  @ApiProperty({
    type: String,
    required: false,
    description: 'Avatar image URL or data URL',
  })
  photo?: string;

  // Buyer onboarding personalization (used for recommendations).
  @Prop({ type: mongoose.Schema.Types.Mixed })
  @ApiProperty({ type: Object, required: false })
  preferences?: {
    businessType?: string;
    fabricTypes?: string[];
    orderSize?: string;
    budget?: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  created_by?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updated_by?: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
