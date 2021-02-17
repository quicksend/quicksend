import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigType } from "@nestjs/config";
import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Queue } from "bull";

import { ItemsProcessor } from "./items.processor";
import { ItemsService } from "./items.service";

import { StorageModule } from "../storage/storage.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { ItemEntity } from "./item.entity";

import { cleanupNamespace } from "../config/config.namespaces";

@Module({
  imports: [
    BullModule.registerQueue({ name: "item" }),

    StorageModule,

    TypeOrmModule.forFeature([ItemEntity]),

    UnitOfWorkModule
  ],
  exports: [BullModule, ItemsService],
  providers: [ItemsProcessor, ItemsService]
})
export class ItemsModule implements OnModuleInit {
  constructor(
    @Inject(cleanupNamespace.KEY)
    private readonly cleanupConfig: ConfigType<typeof cleanupNamespace>,

    @InjectQueue("item")
    private readonly itemsProcessor: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.itemsProcessor.removeJobs("*");
    await this.itemsProcessor.add(
      "deleteOrphanedItems",
      {
        threshold: this.cleanupConfig.limit
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
