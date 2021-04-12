import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { StorageManager } from "./storage.manager";
import { StorageProcessor } from "./storage.processor";
import { StorageService } from "./storage.service";

@Module({
  imports: [BullModule.registerQueue({ name: StorageProcessor.QUEUE_NAME })],
  exports: [BullModule, StorageManager, StorageService],
  providers: [StorageManager, StorageProcessor, StorageService]
})
export class StorageModule {}
