import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ItemEntity } from "./item.entity";
import { ItemsService } from "./items.service";

import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([ItemEntity])],
  exports: [ItemsService],
  providers: [ItemsService]
})
export class ItemsModule {}
