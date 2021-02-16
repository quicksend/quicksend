import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigType } from "@nestjs/config";
import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Queue } from "bull";

import { ItemEntity } from "./item.entity";
import { ItemProcessor } from "./item.processor";
import { ItemService } from "./item.service";

import { StorageModule } from "../storage/storage.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { cleanupNamespace } from "../config/config.namespaces";

@Module({
  imports: [
    BullModule.registerQueue({ name: "item" }),

    StorageModule,

    TypeOrmModule.forFeature([ItemEntity]),

    UnitOfWorkModule
  ],
  exports: [BullModule, ItemService],
  providers: [ItemProcessor, ItemService]
})
export class ItemModule implements OnModuleInit {
  constructor(
    @Inject(cleanupNamespace.KEY)
    private readonly cleanupConfig: ConfigType<typeof cleanupNamespace>,

    @InjectQueue("item")
    private readonly itemProcessor: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.itemProcessor.removeJobs("*");
    await this.itemProcessor.add(
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
