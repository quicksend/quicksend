import { Inject, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { ConfigType } from "@nestjs/config";

import { IncomingMessage } from "http";
import { Queue } from "bull";
import { Readable } from "stream";

import {
  DiskStorageEngine,
  Multiparter,
  MultiparterOptions
} from "@quicksend/multiparter";

import { engineNamespace, limitsNamespace } from "../config/config.namespaces";

@Injectable()
export class StorageService {
  readonly engine = this._determineStorageEngine();

  constructor(
    @Inject(engineNamespace.KEY)
    private readonly engineConfig: ConfigType<typeof engineNamespace>,

    @Inject(limitsNamespace.KEY)
    private readonly limitsConfig: ConfigType<typeof limitsNamespace>,

    @InjectQueue("storage")
    private readonly storageProcessor: Queue
  ) {}

  async delete(filename: string): Promise<void> {
    await this.storageProcessor.add("delete", { filename });
  }

  read(filename: string): Promise<Readable> | Readable {
    return this.engine.createReadable(filename);
  }

  write(
    req: IncomingMessage,
    options?: Partial<MultiparterOptions>
  ): Promise<Multiparter> {
    return new Multiparter({
      busboy: options?.busboy || {
        limits: {
          files: this.limitsConfig.maxFiles,
          fileSize: this.limitsConfig.maxFileSize
        }
      },
      engine: options?.engine || this.engine,
      field: options?.field || "file",
      transformers: options?.transformers || []
    }).parseAsync(req);
  }

  private _determineStorageEngine() {
    switch (this.engineConfig.type) {
      case "disk":
        return new DiskStorageEngine(this.engineConfig.options.disk);

      default:
        return new DiskStorageEngine(this.engineConfig.options.disk);
    }
  }
}
