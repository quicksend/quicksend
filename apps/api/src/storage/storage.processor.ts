import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { StorageService } from "./storage.service";

import { DeleteFileJob, DELETE_FILE_JOB_NAME } from "./jobs/delete-file.job";

@Injectable()
@Processor(StorageProcessor.QUEUE_NAME)
export class StorageProcessor {
  static readonly QUEUE_NAME = "storage";

  constructor(
    @Inject(forwardRef(() => StorageService))
    private readonly storageService: StorageService
  ) {}

  @Process(DELETE_FILE_JOB_NAME)
  deleteFile(job: Job<DeleteFileJob>): Promise<void> {
    return this.storageService.engine.deleteFile(job.data.filename);
  }
}
