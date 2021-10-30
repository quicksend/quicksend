import { Inject, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { EntityRepository, FilterQuery } from "@mikro-orm/core";

import { File as UploadedFile } from "@quicksend/transmit";

import { Queue } from "bull";
import { Readable } from "stream";

import { BrokerService } from "../broker/broker.service";
import { RepositoriesService } from "../repositories/repositories.service";

import { STORAGE_MANAGER } from "./storage.constants";

import { StorageProcessor } from "./storage.processor";

import { File } from "./entities/file.entity";

import { FileEvent } from "./events/file.event";

import { DELETE_FILE } from "./jobs/delete-file.job";
import { SCAN_FILE } from "./jobs/scan-file.job";

import { BaseManager } from "./managers/base.manager";

import { FileNotFoundException } from "./storage.exceptions";

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_MANAGER)
    private readonly storageManager: BaseManager,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue,

    private readonly brokerService: BrokerService,
    private readonly repositoriesService: RepositoriesService
  ) {}

  private get fileRepository(): EntityRepository<File> {
    return this.repositoriesService.getRepository(File);
  }

  async create(uploaded: UploadedFile): Promise<[File, boolean]> {
    const duplicate = await this.fileRepository.findOne({
      hash: uploaded.hash
    });

    if (duplicate) {
      await this.storageProcessor.add(DELETE_FILE, {
        file: {
          id: uploaded.id
        }
      });

      return [duplicate, true];
    }

    const file = new File(uploaded);

    await this.fileRepository.persistAndFlush(file);

    await this.storageProcessor.add(SCAN_FILE, {
      id: file.id
    });

    await this.brokerService.emitAsync(FileEvent.CREATED, {
      created: file
    });

    return [file, false];
  }

  async deleteOne(filter: FilterQuery<File>): Promise<File> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    file.deletedAt = new Date();

    await this.fileRepository.persistAndFlush(file);

    await this.storageProcessor.add(DELETE_FILE, {
      file
    });

    return file;
  }

  async findOne(filter: FilterQuery<File>): Promise<File | null> {
    return this.fileRepository.findOne(filter);
  }

  async findOneOrFail(filter: FilterQuery<File>): Promise<File> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    return file;
  }

  async stream(filter: FilterQuery<File>): Promise<Readable> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    return this.storageManager.createReadableStream(file.id);
  }
}
