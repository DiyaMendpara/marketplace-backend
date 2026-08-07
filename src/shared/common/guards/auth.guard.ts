import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model, isValidObjectId } from 'mongoose';

import { User, UserDocument, UserRole } from '../../../modules/user/model/user.model';
import { Role, RoleDocument } from '../../../modules/role/model/role.model';
import type { AuthRequest } from '../../types/auth-request.interface';
import { messages } from '../../utils/messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
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
      const payload = this.jwtService.verify(token) as { user_id: unknown };
      const user = await this.userModel.findById(payload.user_id).lean();

      if (!user) {
        throw new HttpException(
          { error: 'USER_NOT_FOUND', message: messages.auth.user_not_found },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // A deleted / deactivated / disabled account is rejected on next request.
      if (user.is_deleted || user.is_disabled || user.status === 'inactive') {
        throw new HttpException(
          { error: 'ACCOUNT_DEACTIVATED', message: messages.auth.account_deactivated },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Resolve the role -> name + permissions. A missing or legacy (string)
      let roleName: string | null = typeof user.role === 'string' && !isValidObjectId(user.role) ? user.role : null;
      let roleDoc: RoleDocument | null = null;
      if (user.role && isValidObjectId(user.role)) {
        try {
          roleDoc = await this.roleModel.findById(user.role).lean();
          if (roleDoc) roleName = roleDoc.name;
        } catch {
          roleDoc = null;
        }
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: (roleName ?? 'buyer') as UserRole,
        permissions: roleDoc?.permissions ?? [],
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
