import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { messages } from '../../utils/messages';

// Must run AFTER JwtAuthGuard so req.user is populated.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) || [];

    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !user.role) {
      throw new HttpException(
        { error: 'NO_ROLE', message: messages.auth.permissions_not_found },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new HttpException(
        { error: 'FORBIDDEN', message: messages.auth.no_permission },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
