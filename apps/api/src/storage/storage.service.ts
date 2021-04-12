import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";

import { StorageManager } from "./storage.manager";
import { StorageProcessor } from "./storage.processor";

import { DELETE_FILE_JOB_NAME } from "./jobs/delete-file.job";

@Injectable()
export class StorageService {
  constructor(
    private readonly storageManager: StorageManager,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue
  ) {}

  async createReadableStream(filename: string): Promise<NodeJS.ReadableStream> {
    return this.storageManager.createReadableStream(filename);
  }

  async deleteByFilename(filename: string): Promise<void> {
    await this.storageProcessor.add(DELETE_FILE_JOB_NAME, {
      filename
    });
  }
}
