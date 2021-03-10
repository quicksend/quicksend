import * as fs from "fs";
import * as path from "path";

import { DiskManagerOptions } from "@quicksend/transmit";

import { StorageEngine } from "../storage.engine";

export class DiskStorageEngine implements StorageEngine {
  constructor(private readonly options: DiskManagerOptions) {}

  async createReadableStream(filename: string): Promise<NodeJS.ReadableStream> {
    return fs.createReadStream(path.join(this.options.directory, filename));
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await fs.promises.unlink(path.join(this.options.directory, filename));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
