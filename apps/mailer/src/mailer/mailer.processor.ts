import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";
import { Transporter, createTransport } from "nodemailer";

import { Config } from "../config/config.interface";

import { SEND_EMAIL, SendEmailJob } from "./jobs/send-email.job";

@Injectable()
@Processor(MailerProcessor.QUEUE_NAME)
export class MailerProcessor {
  static readonly QUEUE_NAME = "emails";

  private readonly transporter: Transporter;

  constructor(configService: ConfigService<Config>) {
    this.transporter = createTransport({
      auth: {
        pass: configService.get("SMTP_PASSWORD"),
        user: configService.get("SMTP_USERNAME")
      },
      from: configService.get("SMTP_FROM"),
      host: configService.get("SMTP_HOSTNAME"),
      port: configService.get("SMTP_PORT"),
      secure: true
    });
  }

  @Process(SEND_EMAIL)
  async deleteFile(job: Job<SendEmailJob>): Promise<void> {
    await this.transporter.sendMail(job.data);
  }
}
