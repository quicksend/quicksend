import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { Observable } from "rxjs";

import { RequestContext } from "./request-context.base";

import {
  RequestContextConstructor,
  RequestContextModuleOptions
} from "./request-context.interfaces";

import { REQUEST_CONTEXT_MODULE_OPTIONS } from "./request-context.constants";

export const RequestContextInterceptor = <T extends RequestContext>(
  localContext?: RequestContextConstructor<T>
): Type<NestInterceptor> => {
  class MixinInterceptor implements NestInterceptor {
    constructor(
      @Inject(REQUEST_CONTEXT_MODULE_OPTIONS)
      private readonly requestContextModuleOptions: RequestContextModuleOptions<T>
    ) {}

    intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
      const context = localContext || this.requestContextModuleOptions.context;

      RequestContext.enter(context);

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
};
