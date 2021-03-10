import { ConfigType } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";

import { StorageEngine } from "./storage.engine";
import { StorageProcessor } from "./storage.processor";

import { DiskStorageEngine } from "./engines/disk.engine";

import { DELETE_FILE_JOB_NAME } from "./jobs/delete-file.job";

import { storageNamespace } from "../config/config.namespaces";

@Injectable()
export class StorageService {
  readonly engine = this.createStorageEngine();

  constructor(
    @Inject(storageNamespace.KEY)
    private readonly storageConfig: ConfigType<typeof storageNamespace>,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue
  ) {}

  createReadableStream(filename: string): Promise<NodeJS.ReadableStream> {
    return this.engine.createReadableStream(filename);
  }

  async deleteFile(filename: string): Promise<void> {
    await this.storageProcessor.add(DELETE_FILE_JOB_NAME, {
      filename
    });
  }

  private createStorageEngine(): StorageEngine {
    switch (this.storageConfig.manager) {
      case "disk":
        return new DiskStorageEngine(this.storageConfig.options.disk);

      default:
        return new DiskStorageEngine(this.storageConfig.options.disk);
    }
  }
}
