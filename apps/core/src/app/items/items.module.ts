import { BullAdapter } from "@bull-board/api/bullAdapter";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module, OnModuleInit } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OgmaModule } from "@ogma/nestjs-module";

import { TransmitModule } from "@quicksend/nestjs-transmit";

import { Promisable } from "type-fest";
import { Queue } from "bull";
import { Writable } from "stream";

import { Config } from "../common/config/config.schema";

import { BullBoardService } from "../bull-board/bull-board.service";

import { STORAGE_MANAGER } from "../storage/storage.constants";

import { BaseManager } from "../storage/managers/base.manager";

import { StorageModule } from "../storage/storage.module";

import { ItemsController } from "./items.controller";
import { ItemsProcessor } from "./items.processor";
import { ItemsService } from "./items.service";

import { Invitation } from "./entities/invitation.entity";
import { Item } from "./entities/item.entity";
import { Version } from "./entities/version.entity";

import { DELETE_EXPIRED_INVITATIONS } from "./jobs/delete-expired-invitations";
import { DELETE_EXPIRED_ITEMS } from "./jobs/delete-expired-items.job";
import { DELETE_EXPIRED_LOCKS } from "./jobs/delete-expired-locks.job";
import { DELETE_EXPIRED_VERSIONS } from "./jobs/delete-expired-versions.job";

@Module({
  imports: [
    BullModule.registerQueue({
      name: ItemsProcessor.QUEUE_NAME
    }),

    MikroOrmModule.forFeature({
      entities: [Invitation, Item, Version]
    }),

    OgmaModule.forFeature(ItemsService),

    StorageModule,

    TransmitModule.registerAsync({
      imports: [StorageModule],
      inject: [ConfigService, STORAGE_MANAGER],
      useFactory: (configService: ConfigService<Config>, storageManager: BaseManager) => ({
        manager: {
          handleFile: (file): Promisable<Writable> => storageManager.createWritableStream(file.id),
          removeFile: (file): Promisable<void> => storageManager.removeFile(file.id)
        },
        maxFileSize: configService.get("storage")
      })
    })
  ],
  controllers: [ItemsController],
  exports: [ItemsService],
  providers: [ItemsProcessor, ItemsService]
})
export class ItemsModule implements OnModuleInit {
  constructor(
    private readonly bullBoardService: BullBoardService,

    @InjectQueue(ItemsProcessor.QUEUE_NAME)
    private readonly itemsProcessor: Queue
  ) {
    this.bullBoardService.addQueues(new BullAdapter(this.itemsProcessor));
  }

  async onModuleInit(): Promise<void> {
    await this.createRepeatingJobs();
  }

  private async createRepeatingJobs(): Promise<void> {
    await Promise.all([
      this.itemsProcessor.add(DELETE_EXPIRED_INVITATIONS, {
        repeat: {
          every: 60000
        }
      }),

      this.itemsProcessor.add(DELETE_EXPIRED_ITEMS, {
        repeat: {
          every: 60000
        }
      }),

      this.itemsProcessor.add(DELETE_EXPIRED_LOCKS, {
        repeat: {
          every: 60000
        }
      }),

      this.itemsProcessor.add(DELETE_EXPIRED_VERSIONS, {
        repeat: {
          every: 60000
        }
      })
    ]);
  }
}
