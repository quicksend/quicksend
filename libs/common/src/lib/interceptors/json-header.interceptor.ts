import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { Observable } from "rxjs";

import { Request } from "express";

export interface JSONHeaderInterceptorOptions {
  header?: string;
  silent?: boolean;
}

export const DEFAULT_JSON_HEADER_OPTIONS: Required<JSONHeaderInterceptorOptions> = {
  header: "Quicksend-API-Args",
  silent: false
};

/**
 * Parse a header field as JSON and set it as the request body
 */
export const JSONHeaderInterceptor = (
  options?: JSONHeaderInterceptorOptions
): Type<NestInterceptor> => {
  const { header, silent } = {
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
        throw new BadRequestException(`Header '${header}' must be JSON!`);
      }

      try {
        return JSON.parse(value);
      } catch {
        throw new BadRequestException(`Header '${header}' must be JSON!`);
      }
    }
  }

  return mixin(JSONHeaderMixinInterceptor);
};
