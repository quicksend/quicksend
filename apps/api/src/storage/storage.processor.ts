import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { StorageService } from "./storage.service";

@Injectable()
@Processor("storage")
export class StorageProcessor {
  constructor(private readonly storageService: StorageService) {}

  @Process("delete")
  async delete(job: Job): Promise<void> {
    await this.storageService.engine.delete(job.data.filename);

    return job.progress(100);
  }
}
