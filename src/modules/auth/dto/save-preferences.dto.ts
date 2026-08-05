import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class SavePreferencesDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Fashion brand' })
  businessType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ type: [String], example: ['Woven', 'Knit'] })
  fabricTypes?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '200–500m' })
  orderSize?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '$5–12' })
  budget?: string;
}
