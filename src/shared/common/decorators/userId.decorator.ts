import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from '../../types/auth-request.interface';

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<AuthRequest>().user?._id;
});
