/**
 * Based off of https://github.com/medibloc/nestjs-request-context
 * AsyncLocalStorage should be safe enough to use at the time of writing this comment,
 * as it is literally on the verge of being stable
 * https://github.com/nodejs/node/pull/37675
 */

import { DynamicModule, Module } from "@nestjs/common";

import { RequestContextModuleOptions } from "./request-context.interfaces";

import { REQUEST_CONTEXT_MODULE_OPTIONS } from "./request-context.constants";

@Module({
  exports: [REQUEST_CONTEXT_MODULE_OPTIONS]
})
export class RequestContextModule {
  static register<T>(options: RequestContextModuleOptions<T>): DynamicModule {
    return {
      global: options.isGlobal,
      module: RequestContextModule,
      providers: [
        {
          provide: REQUEST_CONTEXT_MODULE_OPTIONS,
          useValue: options
        }
      ]
    };
  }
}
