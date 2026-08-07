import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { AuthRequest } from '../../types/auth-request.interface';
import { messages } from '../../utils/messages';

// Must run AFTER JwtAuthGuard so req.user (with permissions) is populated.
// Access is granted if the user holds ANY of the required permissions.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const user = req.user;

    // Super Admin and Admin roles hold full system access
    if (user?.role === 'super admin' || user?.role === 'admin') {
      return true;
    }

    if (!user || !user.permissions) {
      throw new HttpException(
        { error: 'NO_PERMISSIONS', message: messages.auth.permissions_not_found },
        HttpStatus.FORBIDDEN,
      );
    }

    const hasAccess = required.some((p) => user.permissions!.includes(p));
    if (!hasAccess) {
      throw new HttpException(
        { error: 'FORBIDDEN', message: messages.auth.no_permission },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
