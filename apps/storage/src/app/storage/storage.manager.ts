import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { Manager } from "./interfaces/manager.interface";

import { DiskManager } from "./managers/disk.manager";

@Injectable()
export class StorageManager implements Manager {
  private readonly manager = this.getManager();

  constructor(private readonly configService: ConfigService) {}

  async createReadableStream(path: string): Promise<NodeJS.ReadableStream> {
    return this.manager.createReadableStream(path);
  }

  async createWritableStream(path: string): Promise<NodeJS.WritableStream> {
    return this.manager.createWritableStream(path);
  }

  async rename(source: string, destination: string): Promise<void> {
    return this.manager.rename(source, destination);
  }

  async unlink(path: string): Promise<void> {
    return this.manager.unlink(path);
  }

  private getManager(): Manager {
    return new DiskManager();
  }
}
