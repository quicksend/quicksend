import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigType } from "@nestjs/config";
import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Queue } from "bull";

import { ItemEntity } from "./item.entity";

import { ItemsProcessor } from "./items.processor";
import { ItemsService } from "./items.service";

import { StorageModule } from "../storage/storage.module";

import { cleanupNamespace } from "../config/config.namespaces";

import { DELETE_ORPHANED_ITEMS_JOB_NAME } from "./jobs/delete-orphaned-items.job";

@Module({
  imports: [
    BullModule.registerQueue({ name: ItemsProcessor.QUEUE_NAME }),

    StorageModule,

    TypeOrmModule.forFeature([ItemEntity])
  ],
  exports: [BullModule, ItemsService],
  providers: [ItemsProcessor, ItemsService]
})
export class ItemsModule implements OnModuleInit {
  constructor(
    @Inject(cleanupNamespace.KEY)
    private readonly cleanupConfig: ConfigType<typeof cleanupNamespace>,

    @InjectQueue(ItemsProcessor.QUEUE_NAME)
    private readonly itemsProcessor: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.itemsProcessor.removeJobs(DELETE_ORPHANED_ITEMS_JOB_NAME);

    await this.itemsProcessor.add(
      DELETE_ORPHANED_ITEMS_JOB_NAME,
      {
        limit: this.cleanupConfig.limit
      },
      {
        removeOnComplete: true,
        repeat: {
          every: this.cleanupConfig.frequency
        }
      }
    );
  }
}
