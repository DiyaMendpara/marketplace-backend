import { IsIn } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateStatusDto {
  @IsIn(['Accepted', 'Preparing', 'Ready for Dispatch', 'Completed'])
  status: OrderStatus;
}
