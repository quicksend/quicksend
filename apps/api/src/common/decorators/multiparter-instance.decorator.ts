import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

export const MultiparterInstance = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    return req.multiparter;
  }
);
