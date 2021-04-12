import fs from "fs";
import path from "path";

import { DiskManager as BaseDiskManager } from "@quicksend/transmit";

import { Manager } from "../interfaces/manager.interface";

export class DiskManager extends BaseDiskManager implements Manager {
  async createReadableStream(filename: string): Promise<NodeJS.ReadableStream> {
    const location = path.join(this.options.directory, filename);

    return fs.createReadStream(location);
  }

  async deleteByFilename(filename: string): Promise<void> {
    const location = path.join(this.options.directory, filename);

    try {
      await fs.promises.unlink(location);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
