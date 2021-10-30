import { BullAdapter } from "@bull-board/api/bullAdapter";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OgmaModule } from "@ogma/nestjs-module";

import { Queue } from "bull";

import { Config } from "../common/config/config.schema";

import { BullBoardService } from "../bull-board/bull-board.service";

import { STORAGE_MANAGER } from "./storage.constants";
import { StorageProcessor } from "./storage.processor";
import { StorageService } from "./storage.service";

import { File } from "./entities/file.entity";

import { Manager } from "./enums/manager.enum";

import { BaseManager } from "./managers/base.manager";
import { DiskManager } from "./managers/disk/disk.manager";
import { S3Manager } from "./managers/s3/s3.manager";

@Module({
  imports: [
    BullModule.registerQueue({
      name: StorageProcessor.QUEUE_NAME
    }),

    MikroOrmModule.forFeature({
      entities: [File]
    }),

    OgmaModule.forFeature(StorageService)
  ],
  exports: [StorageService, STORAGE_MANAGER],
  providers: [
    StorageProcessor,
    StorageService,
    {
      provide: STORAGE_MANAGER,
      inject: [ConfigService, ModuleRef],
      useFactory: (
        configService: ConfigService<Config>,
        moduleRef: ModuleRef
      ): Promise<BaseManager> => {
        const manager = configService.get("storage").manager.type;

        switch (manager) {
          case Manager.DISK:
            return moduleRef.create(DiskManager);

          case Manager.S3:
            return moduleRef.create(S3Manager);

          default:
            return moduleRef.create(DiskManager);
        }
      }
    }
  ]
})
export class StorageModule {
  constructor(
    private readonly bullBoardService: BullBoardService,

    @InjectQueue(StorageProcessor.QUEUE_NAME)
    private readonly storageProcessor: Queue
  ) {
    this.bullBoardService.addQueues(new BullAdapter(this.storageProcessor));
  }
}
