import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { EntityRepository, FilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { Queue } from "bull";

import { StorageManager } from "./storage.manager";
import { StorageProcessor } from "./storage.processor";

import { PhysicalFile } from "./entities/physical-file.entity";

import { DELETE_PHYSICAL_FILE } from "./jobs/delete-physical-file.job";

import { PhysicalFileNotFoundException } from "./storage.exceptions";

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(PhysicalFile)
    private readonly physicalFileRepository: EntityRepository<PhysicalFile>,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue,

    private readonly storageManager: StorageManager
  ) {}

  async create(name: string, hash: string, size: number): Promise<PhysicalFile> {
    const duplicate = await this.physicalFileRepository.findOne({
      $or: [{ hash }, { name }]
    });

    if (duplicate) {
      return duplicate;
    }

    const physicalFile = new PhysicalFile();

    physicalFile.name = name;
    physicalFile.hash = hash;
    physicalFile.size = size;

    return physicalFile;
  }

  async deleteOne(filter: FilterQuery<PhysicalFile>): Promise<PhysicalFile> {
    const physicalFile = await this.physicalFileRepository.findOne(filter);

    if (!physicalFile) {
      throw new PhysicalFileNotFoundException();
    }

    await this.storageProcessor.add(DELETE_PHYSICAL_FILE, {
      filename: physicalFile.name
    });

    await this.physicalFileRepository.removeAndFlush(physicalFile);

    return physicalFile;
  }

  async findOne(filter: FilterQuery<PhysicalFile>): Promise<PhysicalFile> {
    const physicalFile = await this.physicalFileRepository.findOne(filter);

    if (!physicalFile) {
      throw new PhysicalFileNotFoundException();
    }

    return physicalFile;
  }

  async stream(filter: FilterQuery<PhysicalFile>): Promise<NodeJS.ReadableStream> {
    const physicalFile = await this.physicalFileRepository.findOne(filter);

    if (!physicalFile) {
      throw new PhysicalFileNotFoundException();
    }

    return this.storageManager.createReadableStream(physicalFile.name);
  }
}
