import { BullModule } from "@nestjs/bull";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { StorageManager } from "./storage.manager";
import { StorageProcessor } from "./storage.processor";
import { StorageService } from "./storage.service";

import { PhysicalFile } from "./entities/physical-file.entity";

@Module({
  imports: [
    BullModule.registerQueue({ name: StorageProcessor.QUEUE_NAME }),

    MikroOrmModule.forFeature({
      entities: [PhysicalFile]
    })
  ],
  exports: [StorageManager, StorageService],
  providers: [StorageManager, StorageProcessor, StorageService]
})
export class StorageModule {}
