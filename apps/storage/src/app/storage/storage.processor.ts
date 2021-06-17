import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { StorageManager } from "./storage.manager";

import { DELETE_PHYSICAL_FILE, DeletePhysicalFileJob } from "./jobs/delete-physical-file.job";

@Injectable()
@Processor(StorageProcessor.QUEUE_NAME)
export class StorageProcessor {
  static readonly QUEUE_NAME = "storage";

  constructor(private readonly storageManager: StorageManager) {}

  @Process(DELETE_PHYSICAL_FILE)
  async handleFileDeletion(job: Job<DeletePhysicalFileJob>): Promise<void> {
    await this.storageManager.unlink(job.data.filename);
  }
}
