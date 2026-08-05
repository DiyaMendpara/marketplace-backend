import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAllRolesDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search by role name' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: '1' })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: '10' })
  limit?: string;
}
