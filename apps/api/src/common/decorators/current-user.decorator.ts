import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();

    return user || null;
  }
);
