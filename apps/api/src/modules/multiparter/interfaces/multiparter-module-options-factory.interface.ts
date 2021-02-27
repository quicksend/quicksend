import { MultiparterModuleOptions } from "./multiparter-module-options.interface";

export interface MultiparterModuleOptionsFactory {
  createMultiparterOptions():
    | Promise<MultiparterModuleOptions>
    | MultiparterModuleOptions;
}
