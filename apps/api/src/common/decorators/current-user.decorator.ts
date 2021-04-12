import { ExecutionContext, createParamDecorator } from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<Request>().user;
});
