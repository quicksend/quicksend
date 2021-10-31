import { Inject, Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Job } from "bull";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";

import { STORAGE_MANAGER } from "./storage.constants";

import { File } from "./entities/file.entity";

import { FileEvent } from "./events/file.event";

import { DeleteFileJob, DELETE_FILE } from "./jobs/delete-file.job";
import { ScanFileJob, SCAN_FILE } from "./jobs/scan-file.job";

import { BaseManager } from "./managers/base.manager";

import { FileNotFoundException } from "./storage.exceptions";

@Injectable()
@Processor(StorageProcessor.QUEUE_NAME)
export class StorageProcessor {
  static readonly QUEUE_NAME = "storage";

  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService,

    @Inject(STORAGE_MANAGER)
    private readonly storageManager: BaseManager
  ) {}

  private get fileRepository(): EntityRepository<File> {
    return this.entityManagerService.getRepository(File);
  }

  @Process(DELETE_FILE)
  async deleteOne(job: Job<DeleteFileJob>): Promise<void> {
    const file = await this.fileRepository.findOne(job.data.file);

    if (!file) {
      throw new FileNotFoundException();
    }

    await this.storageManager.removeFile(file.id);

    await this.brokerService.emitAsync(FileEvent.DELETED, {
      deleted: file
    });
  }

  @Process(SCAN_FILE)
  async scan(job: Job<ScanFileJob>): Promise<void> {
    const file = await this.fileRepository.findOne(job.data.file);

    if (!file) {
      throw new FileNotFoundException();
    }

    // TODO: Implement ClamAV

    await this.brokerService.emitAsync(FileEvent.SCANNED, {
      scanned: file
    });
  }
}
