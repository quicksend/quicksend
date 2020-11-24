import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ItemEntity } from "./item.entity";
import { ItemProcessor } from "./item.processor";
import { ItemService } from "./item.service";

import { StorageModule } from "../storage/storage.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

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
export class ItemModule {}
