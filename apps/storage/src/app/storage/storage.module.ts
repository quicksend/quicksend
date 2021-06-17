import { BullAdapter } from "bull-board/bullAdapter";
import { BullBoard } from "@quicksend/bull-board";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Queue } from "bull";

import { StorageController } from "./storage.controller";
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
  controllers: [StorageController],
  exports: [StorageManager, StorageService],
  providers: [StorageManager, StorageService]
})
export class StorageModule {
  constructor(@InjectQueue(StorageProcessor.QUEUE_NAME) mailerProcessor: Queue) {
    BullBoard.addQueues(new BullAdapter(mailerProcessor));
  }
}
