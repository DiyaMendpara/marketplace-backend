import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user?._id;
});
