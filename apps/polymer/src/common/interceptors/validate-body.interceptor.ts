import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
  Type,
  ValidationPipeOptions,
  mixin
} from "@nestjs/common";

import { Observable } from "rxjs";
import { Request } from "express";

import { ValidationPipe } from "../pipes/validation.pipe";

export interface ValidateBodyInterceptorOptions {
  exceptionFactory?: (header: string) => HttpException;
  header?: string;
  silent?: boolean;
}

/**
 * Parse a header field as JSON and set it as the request body
 */
export const ValidateBodyInterceptor = <T>(
  dto: Constructor<T>,
  options?: Partial<ValidationPipeOptions>
): Type<NestInterceptor> => {
  @Injectable()
  class ValidateBodyMixinInterceptor implements NestInterceptor {
    async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
      const { body } = ctx.switchToHttp().getRequest<Request>();

      const validator = ValidationPipe({
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
