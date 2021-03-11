import { TransmitModuleOptions } from "./transmit-module-options.interface";

export interface TransmitModuleOptionsFactory {
  createTransmitOptions():
    | Promise<TransmitModuleOptions>
    | TransmitModuleOptions;
}
