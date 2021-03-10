import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { StorageProcessor } from "./storage.processor";
import { StorageService } from "./storage.service";

@Module({
  imports: [BullModule.registerQueue({ name: StorageProcessor.QUEUE_NAME })],
  exports: [BullModule, StorageService],
  providers: [StorageProcessor, StorageService]
})
export class StorageModule {}
