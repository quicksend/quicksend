import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { MailerProcessor } from "./mailer.processor";
import { MailerService } from "./mailer.service";

@Module({
  imports: [BullModule.registerQueue({ name: MailerProcessor.QUEUE_NAME })],
  exports: [MailerService],
  providers: [MailerProcessor, MailerService]
})
export class MailerModule {}
