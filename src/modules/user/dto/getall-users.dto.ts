import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import type { UserRole } from '../model/user.model';

export class GetAllUsersDTO {
  @IsOptional()
  @IsIn(['buyer', 'supplier', 'admin'])
  @ApiPropertyOptional({ enum: ['buyer', 'supplier', 'admin'] })
  role?: UserRole;
}
