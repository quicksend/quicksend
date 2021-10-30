import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";
import { Transporter, createTransport } from "nodemailer";

import { Config } from "../common/config/config.schema";

import { SendEmailJob, SEND_EMAIL } from "./jobs/send-email.job";

@Injectable()
@Processor(MailerProcessor.QUEUE_NAME)
export class MailerProcessor {
  static readonly QUEUE_NAME = "emails";

  private readonly transporter: Transporter;

  constructor(configService: ConfigService<Config>) {
    this.transporter = createTransport({
      auth: {
        pass: configService.get("smtp").password,
        user: configService.get("smtp").username
      },
      from: configService.get("smtp").from,
      host: configService.get("smtp").hostname,
      port: configService.get("smtp").port,
      secure: true
    });
  }

  @Process(SEND_EMAIL)
  async sendEmail(job: Job<SendEmailJob>): Promise<void> {
    await this.transporter.sendMail(job.data);
  }
}
