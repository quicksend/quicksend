import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

export const CurrentUser = createParamDecorator(
  (field: keyof Request["user"], ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user;
    return field ? user && user[field] : user;
  }
);
