import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @MinLength(1)
  @ApiProperty({ type: String, example: 'currentPass1' })
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @ApiProperty({ type: String, example: 'newSecret123' })
  newPassword: string;
}
