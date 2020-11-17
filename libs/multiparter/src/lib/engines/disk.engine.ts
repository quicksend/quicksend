import * as fs from "fs";
import * as path from "path";

import { Readable, Writable } from "stream";

import { StorageEngine } from "../interfaces/storage-engine.interface";

import { chunk } from "@quicksend/utils";

export interface DiskStorageEngineOptions {
  directory: string;
}

export class DiskStorageEngine implements StorageEngine {
  constructor(private readonly options: DiskStorageEngineOptions) {
    if (!path.isAbsolute(options.directory)) {
      throw new Error("Directory for disk storage must be absolute!");
    }
  }

  createReadable(filename: string): Readable {
    return fs.createReadStream(this._getLocationOnDisk(filename));
  }

  async createWritable(filename: string): Promise<Writable> {
    await fs.promises.mkdir(this._getDestinationOnDisk(filename), {
      recursive: true
    });

    return fs.createWriteStream(this._getLocationOnDisk(filename));
  }

  async delete(filename: string): Promise<void> {
    try {
      await fs.promises.unlink(this._getLocationOnDisk(filename));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private _getDestinationOnDisk(filename: string) {
    return path.join(
      this.options.directory,
      chunk.string(filename.slice(0, -1), 2).join(path.sep)
    );
  }

  private _getLocationOnDisk(filename: string) {
    return path.join(this._getDestinationOnDisk(filename), filename);
  }
}
