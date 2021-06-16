import { BullAdapter } from "bull-board/bullAdapter";
import { BullBoard } from "@quicksend/bull-board";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { Queue } from "bull";

import { MailerController } from "./mailer.controller";
import { MailerProcessor } from "./mailer.processor";
import { MailerService } from "./mailer.service";

@Module({
  imports: [BullModule.registerQueue({ name: MailerProcessor.QUEUE_NAME })],
  controllers: [MailerController],
  exports: [MailerService],
  providers: [MailerProcessor, MailerService]
})
export class MailerModule {
  constructor(@InjectQueue(MailerProcessor.QUEUE_NAME) mailerProcessor: Queue) {
    BullBoard.addQueues(new BullAdapter(mailerProcessor));
  }
}
