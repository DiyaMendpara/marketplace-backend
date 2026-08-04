import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import type { UserRole } from '../../user/model/user.model';

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @ApiProperty({ type: String, example: 'Jane Doe' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: 'jane@nova.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @ApiProperty({ type: String, example: 'secret123' })
  password: string;

  @IsIn(['buyer', 'supplier'])
  @ApiProperty({ enum: ['buyer', 'supplier'], example: 'buyer' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, example: 'Nova Apparel Ltd.' })
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @ApiProperty({ type: String, required: false, example: '+1 555 0100' })
  phone?: string;
}
