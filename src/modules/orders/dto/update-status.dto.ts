import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['Accepted', 'Preparing', 'Ready for Dispatch', 'Completed'])
  status: string;
}
