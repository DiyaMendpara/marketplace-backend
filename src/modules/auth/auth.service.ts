import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { messages } from '../../shared/utils/messages';
import {
  sendBadRequest,
  sendSuccess,
  sendSystemError,
} from '../../shared/utils/response';
import { User, UserDocument } from '../user/model/user.model';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDTO) {
    try {
      const emailNormalized = body.email ? body.email.trim().toLowerCase() : '';

      const existing = await this.userModel.findOne({ email: emailNormalized });
      if (existing) {
        return sendBadRequest(messages.user.email_exists);
      }

      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      const user = await this.userModel.create({
        name: body.name,
        email: emailNormalized,
        password: hashedPassword,
        role: body.role,
        companyName: body.companyName,
        phone: body.phone,
      });

      const token = this.jwtService.sign({ user_id: user._id });
      return sendSuccess(messages.user.user_registered, {
        token,
        user: this.toPublic(user),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async login(body: LoginDTO) {
    try {
      const emailNormalized = body.email ? body.email.trim().toLowerCase() : '';

      const user = await this.userModel
        .findOne({ email: emailNormalized })
        .select('+password');

      if (!user || !user.password) {
        return sendBadRequest(messages.user.user_login_failed);
      }

      const isMatch = await bcrypt.compare(body.password, user.password);
      if (!isMatch) {
        return sendBadRequest(messages.user.user_login_failed);
      }

      const token = this.jwtService.sign({ user_id: user._id });
      return sendSuccess(messages.user.user_login, {
        token,
        user: this.toPublic(user),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async getProfile(user_id: string) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        return sendBadRequest(messages.user.user_not_found);
      }
      return sendSuccess(messages.user.profile_fetched, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  private toPublic(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      phone: user.phone,
    };
  }
}
