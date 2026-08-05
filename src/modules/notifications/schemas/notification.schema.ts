import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type NotificationDocument = HydratedDocument<Notification>;
@Schema({ timestamps: true })
export class Notification { @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId: Types.ObjectId; @Prop({ required: true }) title: string; @Prop({ required: true }) body: string; @Prop() link?: string; @Prop({ default: false }) read: boolean; }
export const NotificationSchema = SchemaFactory.createForClass(Notification);
