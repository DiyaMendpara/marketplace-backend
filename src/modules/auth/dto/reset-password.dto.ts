import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Reset code (OTP) is required' })
  otp: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}
