import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @MinLength(2)
  @ApiProperty({ type: String, example: 'moderator' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], example: ['product.view', 'order.view'] })
  permissions: string[];
}
