/* eslint-disable @typescript-eslint/no-explicit-any */

import { ModuleMetadata } from "@nestjs/common/interfaces";
import { Type } from "@nestjs/common";

import { TransmitModuleOptions } from "./transmit-module-options.interface";
import { TransmitModuleOptionsFactory } from "./transmit-module-options-factory.interface";

// prettier-ignore
export interface TransmitModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<TransmitModuleOptionsFactory>;
  useClass?: Type<TransmitModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<TransmitModuleOptions> | TransmitModuleOptions;
  inject?: any[];
}
