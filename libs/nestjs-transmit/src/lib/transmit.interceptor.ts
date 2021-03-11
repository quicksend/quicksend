import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { Transmit, TransmitOptions } from "@quicksend/transmit";

import { Observable, EMPTY } from "rxjs";
import { catchError } from "rxjs/operators";

import { TransmitModuleOptions } from "./transmit.interfaces";

import { TRANSMIT_MODULE_OPTIONS } from "./transmit.constants";

export const TransmitInterceptor = (
  localTransmitOptions: Partial<TransmitOptions> = {}
): Type<NestInterceptor> => {
  class MixinInterceptor implements NestInterceptor {
    constructor(
      @Inject(TRANSMIT_MODULE_OPTIONS)
      private readonly transmitOptions: TransmitModuleOptions
    ) {}

    async intercept(
      ctx: ExecutionContext,
      next: CallHandler
    ): Promise<Observable<unknown>> {
      const req = ctx.switchToHttp().getRequest();

      const transmit = new Transmit({
        ...this.transmitOptions,
        ...localTransmitOptions
      });

      const { fields, files } = await transmit.parseAsync(req);

      // If the upload was aborted, skip the controller
      if (transmit.aborted) {
        return EMPTY;
      }

      req.fields = fields;
      req.files = files;

      return next.handle().pipe(
        // If the controller throws an error, then roll back all uploads
        catchError(async (error) => {
          if (files.length > 0) {
            await transmit.deleteUploadedFiles();
          }

          throw error;
        })
      );
    }
  }

  return mixin(MixinInterceptor);
};
