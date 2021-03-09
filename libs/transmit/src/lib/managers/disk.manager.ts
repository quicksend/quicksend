import * as fs from "fs";
import * as path from "path";

import { chunk } from "@quicksend/utils";

import { TransmitManager } from "../transmit.interfaces";

export interface DiskManagerOptions {
  directory: string;
}

export class DiskManager implements TransmitManager {
  constructor(private readonly options: DiskManagerOptions) {}

  async createReadable(filename: string): Promise<NodeJS.ReadableStream> {
    return fs.createReadStream(this.getLocationOnDisk(filename));
  }

  async createWritable(filename: string): Promise<NodeJS.WritableStream> {
    await fs.promises.mkdir(this.getDestinationOnDisk(filename), {
      recursive: true
    });

    return fs.createWriteStream(this.getLocationOnDisk(filename));
  }

  async delete(filename: string): Promise<void> {
    try {
      await fs.promises.unlink(this.getLocationOnDisk(filename));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private getDestinationOnDisk(filename: string): string {
    return path.join(
      this.options.directory,
      chunk.string(filename.slice(0, -1), 2).join(path.sep)
    );
  }

  private getLocationOnDisk(filename: string): string {
    return path.join(this.getDestinationOnDisk(filename), filename);
  }
}
