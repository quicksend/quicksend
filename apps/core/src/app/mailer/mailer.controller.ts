import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { MailerService } from "./mailer.service";

import { EmailTemplates } from "./enums/email-templates.enum";

import { SendEmailPayload } from "./payloads/send-email.payload";

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern("mailer.email.send")
  send(@Payload() payload: SendEmailPayload): Promise<void> {
    return this.mailerService.renderAndSend(payload.template, payload.context, {
      subject: payload.subject,
      to: payload.to
    });
  }
}
