import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { TransmitModuleOptions, TransmitModuleOptionsFactory } from "@quicksend/nestjs-transmit";

import { Config } from "../config.interface";

import { StorageManager } from "../../../storage/storage.manager";

@Injectable()
export class TransmitModuleConfig implements TransmitModuleOptionsFactory {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly storageManager: StorageManager
  ) {}

  createTransmitOptions(): TransmitModuleOptions {
    const { maxFileSize } = this.configService.get("storage") as Config["storage"];

    return {
      manager: this.storageManager,
      maxFileSize
    };
  }
}
