import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserId } from '../../shared/common/decorators/userId.decorator';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { messages } from '../../shared/utils/messages';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({ description: messages.user.user_registered })
  @ApiBody({ type: RegisterDTO })
  async register(@Body() body: RegisterDTO) {
    return await this.authService.register(body);
  }

  @Post('login')
  @ApiOkResponse({ description: messages.user.user_login })
  @ApiBody({ type: LoginDTO })
  async login(@Body() body: LoginDTO) {
    return await this.authService.login(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: messages.user.profile_fetched })
  async getProfile(@UserId() user_id: string) {
    return await this.authService.getProfile(user_id);
  }
}
