import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { IncomingMessage } from "http";
import { Queue } from "bull";
import { Readable } from "stream";

import {
  DiskStorageEngine,
  Multiparter,
  MultiparterOptions
} from "@quicksend/multiparter";

import { config } from "@quicksend/config";

@Injectable()
export class StorageService {
  readonly engine = this._determineStorageEngine();

  constructor(
    @InjectQueue("storage")
    private readonly storageProcessor: Queue
  ) {}

  async delete(filename: string): Promise<void> {
    await this.storageProcessor.add("delete", { filename });
  }

  read(filename: string): Promise<Readable> | Readable {
    return this.engine.createReadable(filename);
  }

  // TODO: Deep merge options
  write(
    req: IncomingMessage,
    options?: Partial<MultiparterOptions>
  ): Promise<Multiparter> {
    return new Multiparter({
      busboy: {
        limits: config.get("storage").limits
      },
      engine: this.engine,
      field: "file",
      ...options
    }).parse(req);
  }

  private _determineStorageEngine() {
    const { engine, options } = config.get("storage");

    switch (engine) {
      case "disk":
        return new DiskStorageEngine(options);

      case "google-cloud":
        return new DiskStorageEngine(options); // TODO: Need to create google cloud storage engine

      default:
        return new DiskStorageEngine(options);
    }
  }
}
