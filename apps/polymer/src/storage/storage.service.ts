import { BullAdapter } from "bull-board/bullAdapter";
import { BullBoard } from "@quicksend/bull-board";

import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { File as FileMetadata } from "@quicksend/transmit";
import { PassThrough } from "stream";
import { Queue } from "bull";

import { Config } from "../common/config/config.interface";

import { Counter } from "../common/utils/counter.util";

import { RepositoriesService } from "../repositories/repositories.service";

import { StorageManager } from "./storage.manager";
import { StorageProcessor } from "./storage.processor";

import { File } from "../files/entities/file.entity";
import { PhysicalFile } from "./entities/physical-file.entity";

import { CreatePhysicalFileResult } from "./interfaces/create-physical-file-result.interface";

import { DELETE_FILE_JOB_NAME } from "./jobs/delete-file.job";

@Injectable()
export class StorageService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly repositoriesService: RepositoriesService,

    private readonly storageManager: StorageManager,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue
  ) {}

  private get physicalFileRepository(): EntityRepository<PhysicalFile> {
    return this.repositoriesService.getRepository(PhysicalFile);
  }

  onModuleInit(): void {
    BullBoard.addQueues(new BullAdapter(this.storageProcessor));
  }

  async create(metadata: FileMetadata): Promise<CreatePhysicalFileResult> {
    const duplicate = await this.physicalFileRepository.findOne({ hash: metadata.hash });

    if (duplicate) {
      return {
        isNew: false,
        physicalFile: duplicate
      };
    }

    const physicalFile = new PhysicalFile();

    physicalFile.filename = metadata.discriminator;
    physicalFile.hash = metadata.hash;
    physicalFile.size = metadata.size;

    await this.physicalFileRepository.persistAndFlush(physicalFile);

    return {
      isNew: true,
      physicalFile
    };
  }

  async remove(physicalFile: PhysicalFile): Promise<void> {
    await this.physicalFileRepository.nativeDelete({
      id: physicalFile.id
    });

    await this.storageProcessor.add(DELETE_FILE_JOB_NAME, {
      filename: physicalFile.filename
    });
  }

  async stream(filter: FilterQuery<PhysicalFile>): Promise<NodeJS.ReadableStream> {
    const physicalFile = await this.physicalFileRepository.findOne(filter);

    if (!physicalFile) {
      throw new Error("Physical file could not be found");
    }

    return this.storageManager.createReadableStream(physicalFile.filename);
  }

  private getOrphanedFilesStream(limit?: number): PassThrough {
    const knex = this.repositoriesService.getEntityManager().getKnex();
    const tableName = this.repositoriesService.getTableName(PhysicalFile.name);

    const query = knex<PhysicalFile>(tableName)
      .select("*")
      .whereNotExists(
        knex<File>(this.repositoriesService.getTableName(File.name))
          .select(knex.raw(1))
          .where("hash", knex.ref(`${tableName}.hash`))
      );

    if (limit) {
      query.limit(limit);
    }

    return query.stream();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async purgeOrphanedFiles(): Promise<void> {
    const { limit } = this.configService.get("purge") as Config["purge"];

    const orphans = this.getOrphanedFilesStream(limit);

    return new Promise((resolve, reject) => {
      const pendingDeletes = new Counter();

      orphans.on("data", (orphan: PhysicalFile) => {
        pendingDeletes.increment();

        this.remove(orphan)
          .then(() => pendingDeletes.decrement())
          .catch((error) => reject(error));
      });

      orphans.once("end", () => pendingDeletes.onceItEqualsTo(0, resolve));
      orphans.once("error", (error) => reject(error));
    });
  }
}
