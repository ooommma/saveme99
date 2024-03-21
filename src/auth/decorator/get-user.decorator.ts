import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Users } from '../../user/entities/users.entity';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): Users => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
