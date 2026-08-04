import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: String, example: 'jane@nova.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: 'secret123' })
  password: string;
}
