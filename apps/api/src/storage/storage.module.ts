import { BullModule } from "@nestjs/bull";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { StorageProcessor } from "./storage.processor";
import { StorageService } from "./storage.service";

@Module({
  imports: [BullModule.registerQueue({ name: "storage" }), ConfigModule],
  exports: [BullModule, StorageService],
  providers: [StorageProcessor, StorageService]
})
export class StorageModule {}
