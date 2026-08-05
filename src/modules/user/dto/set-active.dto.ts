import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetActiveDTO {
  @IsBoolean()
  @ApiProperty({ type: Boolean, example: false })
  active: boolean;
}
