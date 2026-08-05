import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../../../modules/user/model/user.model';
import type { AuthRequest } from '../../types/auth-request.interface';
import { messages } from '../../utils/messages';

// Must run AFTER JwtAuthGuard so req.user is populated.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Read @Roles from both the handler and the controller class, so a
    // class-level @Roles('admin') protects every route in the controller.
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthRequest>();
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
