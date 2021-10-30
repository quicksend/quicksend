import {
  CallHandler,
  ExecutionContext,
  HttpException,
  NestInterceptor,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
  mixin
} from "@nestjs/common";

import { Constructor } from "type-fest";

import { Observable } from "rxjs";

import { Request } from "express";

export interface ValidateBodyInterceptorOptions {
  exceptionFactory?: (header: string) => HttpException;
  header?: string;
  silent?: boolean;
}

export const ValidateBodyInterceptor = <T>(
  dto: Constructor<T>,
  options?: Partial<ValidationPipeOptions>
): Type<NestInterceptor> => {
  class ValidateBodyMixinInterceptor implements NestInterceptor {
    async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
      const { body } = ctx.switchToHttp().getRequest<Request>();

      const validator = new ValidationPipe({
        ...options,
        expectedType: dto
      });

      await validator.transform(body, {
        metatype: dto,
        type: "body"
      });

      return next.handle();
    }
  }

  return mixin(ValidateBodyMixinInterceptor);
};
