import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import {
  TransmitModuleOptions,
  TransmitModuleOptionsFactory
} from "@quicksend/nest-transmit";

import { DiskManager } from "@quicksend/transmit";

import {
  limitsNamespace,
  storageNamespace
} from "../../config/config.namespaces";

@Injectable()
export class TransmitModuleConfig implements TransmitModuleOptionsFactory {
  constructor(
    @Inject(limitsNamespace.KEY)
    private limitsConfig: ConfigType<typeof limitsNamespace>,

    @Inject(storageNamespace.KEY)
    private storageConfig: ConfigType<typeof storageNamespace>
  ) {}

  createTransmitOptions(): TransmitModuleOptions {
    return {
      field: "file",
      manager: new DiskManager(this.storageConfig.options.disk),
      maxFileSize: this.limitsConfig.maxFileSize
    };
  }
}
