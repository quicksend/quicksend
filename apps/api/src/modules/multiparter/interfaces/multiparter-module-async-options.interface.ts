import { ModuleMetadata } from "@nestjs/common/interfaces";
import { Type } from "@nestjs/common";

import { MultiparterModuleOptions } from "./multiparter-module-options.interface";
import { MultiparterModuleOptionsFactory } from "./multiparter-module-options-factory.interface";

// prettier-ignore
export interface MultiparterModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<MultiparterModuleOptionsFactory>;
  useClass?: Type<MultiparterModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MultiparterModuleOptions> | MultiparterModuleOptions;
  inject?: any[];
}
