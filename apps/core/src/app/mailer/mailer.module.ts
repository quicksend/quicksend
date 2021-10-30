import { BullAdapter } from "@bull-board/api/bullAdapter";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { Queue } from "bull";

import { BullBoardService } from "../bull-board/bull-board.service";

import { MailerController } from "./mailer.controller";
import { MailerProcessor } from "./mailer.processor";
import { MailerService } from "./mailer.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: MailerProcessor.QUEUE_NAME
    })
  ],
  controllers: [MailerController],
  exports: [MailerService],
  providers: [MailerProcessor, MailerService]
})
export class MailerModule {
  constructor(
    private readonly bullBoardService: BullBoardService,

    @InjectQueue(MailerProcessor.QUEUE_NAME)
    private readonly mailerProcessor: Queue
  ) {
    this.bullBoardService.addQueues(new BullAdapter(this.mailerProcessor));
  }
}
