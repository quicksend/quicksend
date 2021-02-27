import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { Multiparter, MultiparterOptions } from "@quicksend/multiparter";

import { Observable } from "rxjs";

import { Request } from "../../common/interfaces/request.interface";

import { MultiparterModuleOptions } from "./interfaces/multiparter-module-options.interface";

import { MULTIPARTER_MODULE_OPTIONS } from "./multiparter.constants";

export const MultiparterInterceptor = (
  localMultiparterOptions: Partial<MultiparterOptions> = {}
): Type<NestInterceptor> => {
  class MixinInterceptor implements NestInterceptor {
    constructor(
      @Inject(MULTIPARTER_MODULE_OPTIONS)
      private readonly multiparterOptions: MultiparterModuleOptions
    ) {}

    async intercept(
      ctx: ExecutionContext,
      next: CallHandler
    ): Promise<Observable<any>> {
      const req = ctx.switchToHttp().getRequest<Request>();

      const multiparter = await new Multiparter({
        ...this.multiparterOptions,
        ...localMultiparterOptions
      }).parseAsync(req);

      req.multiparter = multiparter;

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
};
