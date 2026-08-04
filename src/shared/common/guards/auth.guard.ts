import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../../modules/user/model/user.model';
import { messages } from '../../utils/messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization || req.headers.Authorization;

    let token: string | undefined;
    if (authHeader) {
      token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
    }

    if (!token) {
      throw new HttpException(
        { error: 'NO_TOKEN', message: messages.auth.token_missing },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.user_id).lean();

      if (!user) {
        throw new HttpException(
          { error: 'USER_NOT_FOUND', message: messages.auth.user_not_found },
          HttpStatus.UNAUTHORIZED,
        );
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        { error: 'INVALID_TOKEN', message: messages.auth.unauthorized },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
