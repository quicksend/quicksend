import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Fields = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.fields;
  }
);
