import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  fabricType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  pricePerMeter: number;

  @IsNumber()
  @Min(1)
  moq: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsArray()
  colors?: { name: string; hex: string; image?: string }[];

  @IsOptional()
  @IsString()
  swatch?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
