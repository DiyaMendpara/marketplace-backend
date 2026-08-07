import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
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
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SavePreferencesDTO } from './dto/save-preferences.dto';
import { GoogleAuthDTO } from './dto/google-auth.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

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

  @Post('google')
  @ApiOkResponse({ description: messages.user.user_login })
  @ApiBody({ type: GoogleAuthDTO })
  async google(@Body() body: GoogleAuthDTO) {
    return await this.authService.googleAuth(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: messages.user.profile_fetched })
  async getProfile(@UserId() user_id: string) {
    return await this.authService.getProfile(user_id);
  }

  @Put('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: messages.user.profile_updated })
  @ApiBody({ type: UpdateProfileDTO })
  async updateProfile(
    @UserId() user_id: string,
    @Body() body: UpdateProfileDTO,
  ) {
    return await this.authService.updateProfile(user_id, body);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: messages.auth.password_changed })
  @ApiBody({ type: ChangePasswordDTO })
  async changePassword(
    @UserId() user_id: string,
    @Body() body: ChangePasswordDTO,
  ) {
    return await this.authService.changePassword(user_id, body);
  }

  @Put('preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: messages.user.profile_updated })
  @ApiBody({ type: SavePreferencesDTO })
  async savePreferences(
    @UserId() user_id: string,
    @Body() body: SavePreferencesDTO,
  ) {
    return await this.authService.savePreferences(user_id, body);
  }

  @Post('forgot-password')
  @ApiOkResponse({ description: messages.auth.forgot_password_sent })
  @ApiBody({ type: ForgotPasswordDTO })
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    return await this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiOkResponse({ description: messages.auth.password_reset_success })
  @ApiBody({ type: ResetPasswordDTO })
  async resetPassword(@Body() body: ResetPasswordDTO) {
    return await this.authService.resetPassword(body);
  }
}
