import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDTO {
  @IsString()
  @ApiProperty({ description: 'Google ID token (JWT credential from Google Sign-In)' })
  credential: string;

  // Role to assign if this is a first-time Google sign-in (defaults to buyer).
  @IsOptional()
  @IsIn(['buyer', 'supplier'])
  @ApiPropertyOptional({ enum: ['buyer', 'supplier'] })
  role?: 'buyer' | 'supplier';
}
