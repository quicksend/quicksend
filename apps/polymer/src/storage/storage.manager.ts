import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { Config } from "../common/config/config.interface";

import { Manager } from "./interfaces/manager.interface";

import { DiskManager } from "./managers/disk.manager";
import { IncomingFile } from "@quicksend/transmit";

@Injectable()
export class StorageManager {
  private readonly manager = this.createManager();

  constructor(private readonly configService: ConfigService<Config>) {}

  async createReadableStream(filename: string): Promise<NodeJS.ReadableStream> {
    return this.manager.createReadableStream(filename);
  }

  async createWritableStream(file: IncomingFile): Promise<NodeJS.WritableStream> {
    return this.manager.createWritableStream(file);
  }

  async deleteFile(file: IncomingFile): Promise<void> {
    return this.manager.deleteFile(file);
  }

  async deleteByFilename(filename: string): Promise<void> {
    return this.manager.deleteByFilename(filename);
  }

  private createManager(): Manager {
    const { manager, options } = this.configService.get("storage") as Config["storage"];

    switch (manager) {
      case "disk":
        return new DiskManager(options);

      default:
        return new DiskManager(options);
    }
  }
}
