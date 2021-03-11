import { ConfigType } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";

import { DiskManager } from "@quicksend/transmit";

import {
  TransmitModuleOptions,
  TransmitModuleOptionsFactory
} from "@quicksend/nestjs-transmit";

import {
  limitsNamespace,
  storageNamespace
} from "../../config/config.namespaces";

@Injectable()
export class TransmitModuleConfig implements TransmitModuleOptionsFactory {
  constructor(
    @Inject(limitsNamespace.KEY)
    private readonly limitsConfig: ConfigType<typeof limitsNamespace>,

    @Inject(storageNamespace.KEY)
    private readonly storageConfig: ConfigType<typeof storageNamespace>
  ) {}

  get transmitManager() {
    switch (this.storageConfig.manager) {
      case "disk":
        return new DiskManager(this.storageConfig.options.disk);

      default:
        return new DiskManager(this.storageConfig.options.disk);
    }
  }

  createTransmitOptions(): TransmitModuleOptions {
    return {
      field: "file",
      manager: this.transmitManager,
      maxFileSize: this.limitsConfig.maxFileSize
    };
  }
}
