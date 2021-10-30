import { BullAdapter } from "@bull-board/api/bullAdapter";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { Queue } from "bull";

import { BullBoardService } from "../bull-board/bull-board.service";

import { BrokerProcessor } from "./broker.processor";
import { BrokerService } from "./broker.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: BrokerProcessor.QUEUE_NAME
    })
  ],
  exports: [BrokerService],
  providers: [BrokerProcessor, BrokerService]
})
export class BrokerModule {
  constructor(
    private readonly bullBoardService: BullBoardService,

    @InjectQueue(BrokerProcessor.QUEUE_NAME)
    private readonly brokerProcessor: Queue
  ) {
    this.bullBoardService.addQueues(new BullAdapter(this.brokerProcessor));
  }
}
