import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { Observable } from "rxjs";

import { Request } from "express";

export interface JSONHeaderInterceptorOptions {
  exceptionFactory?: (header: string) => HttpException;
  header?: string;
  silent?: boolean;
}

export const DEFAULT_JSON_HEADER_OPTIONS: Required<JSONHeaderInterceptorOptions> = {
  exceptionFactory: (header) => new BadRequestException(`Header '${header}' must be JSON!`),
  header: "Quicksend-API-Args",
  silent: false
};

/**
 * Parse a header field as JSON and set it as the request body
 */
export const JSONHeaderInterceptor = (
  options?: JSONHeaderInterceptorOptions
): Type<NestInterceptor> => {
  const { exceptionFactory, header, silent } = {
    ...DEFAULT_JSON_HEADER_OPTIONS,
    ...options
  };

  class JSONHeaderMixinInterceptor implements NestInterceptor {
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
      const req = ctx.switchToHttp().getRequest<Request>();

      try {
        req.body = this.parse(req.headers[header.toLowerCase()]);
      } catch (error) {
        req.body = {};

        if (!silent) {
          throw error;
        }
      }

      return next.handle();
    }

    private parse(value: unknown): Record<string, unknown> {
      if (typeof value !== "string") {
        throw exceptionFactory(header);
      }

      try {
        return JSON.parse(value);
      } catch {
        throw exceptionFactory(header);
      }
    }
  }

  return mixin(JSONHeaderMixinInterceptor);
};
