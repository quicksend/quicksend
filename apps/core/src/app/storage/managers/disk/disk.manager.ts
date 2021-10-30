import fs from "fs";
import path from "path";

import { Readable, Writable } from "stream";

import { Injectable, OnModuleInit } from "@nestjs/common";

import { BaseManager } from "../base.manager";

import { DiskManagerOptions, diskManagerOptionsSchema } from "./disk-manager-options.schema";

@Injectable()
export class DiskManager extends BaseManager implements OnModuleInit {
  private options!: DiskManagerOptions;

  async onModuleInit(): Promise<void> {
    this.options = await this.parseOptions(diskManagerOptionsSchema);
  }

  buildPathRelativeToDirectory(...paths: string[]): string {
    return path.join(this.options.directory, ...paths);
  }

  createReadableStream(id: string): Readable {
    const path = this.buildPathRelativeToDirectory(id);

    return fs.createReadStream(path);
  }

  createWritableStream(id: string): Writable {
    const path = this.buildPathRelativeToDirectory(id);

    return fs.createWriteStream(path);
  }

  removeFile(id: string): Promise<void> {
    const path = this.buildPathRelativeToDirectory(id);

    return fs.promises.unlink(path);
  }
}
