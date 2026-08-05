import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, example: 'Jane Doe' })
  name?: string;

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

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Avatar image URL or data URL',
  })
  photo?: string;
}
