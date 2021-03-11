import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Files = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.files;
  }
);
