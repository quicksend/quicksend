import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { StorageManager } from "./storage.manager";

import { DELETE_FILE_JOB_NAME, DeleteFileJob } from "./jobs/delete-file.job";

@Injectable()
@Processor(StorageProcessor.QUEUE_NAME)
export class StorageProcessor {
  static readonly QUEUE_NAME = "storage";

  constructor(private readonly storageManager: StorageManager) {}

  @Process(DELETE_FILE_JOB_NAME)
  deleteFile(job: Job<DeleteFileJob>): Promise<void> {
    return this.storageManager.deleteByFilename(job.data.filename);
  }
}
