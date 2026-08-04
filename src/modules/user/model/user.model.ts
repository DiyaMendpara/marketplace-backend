import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'buyer' | 'supplier';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  @ApiProperty({ type: String, example: 'Jane Doe' })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  @ApiProperty({ type: String, example: 'jane@nova.com' })
  email: string;

  // Never returned by default; explicitly .select('+password') when needed.
  @Prop({ required: true, select: false })
  @ApiProperty({ type: String, example: 'secret123' })
  password: string;

  @Prop({ required: true, enum: ['buyer', 'supplier'] })
  @ApiProperty({ enum: ['buyer', 'supplier'], example: 'buyer' })
  role: UserRole;

  @Prop({ trim: true })
  @ApiProperty({ type: String, required: false, example: 'Nova Apparel Ltd.' })
  companyName?: string;

  @Prop({ trim: true })
  @ApiProperty({ type: String, required: false, example: '+1 555 0100' })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
