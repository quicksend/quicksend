import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";
import { Transporter, createTransport } from "nodemailer";

import { Config } from "../common/config/config.interface";

import { SEND_EMAIL_JOB_NAME, SendEmailJob } from "./jobs/send-email.job";

@Injectable()
@Processor(MailerProcessor.QUEUE_NAME)
export class MailerProcessor {
  static readonly QUEUE_NAME = "emails";

  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService<Config>) {
    const smtp = this.configService.get("smtp") as Config["smtp"];

    this.transporter = createTransport({
      auth: {
        pass: smtp.password,
        user: smtp.username
      },
      from: smtp.from,
      host: smtp.hostname,
      port: smtp.port,
      secure: smtp.secure
    });
  }

  @Process(SEND_EMAIL_JOB_NAME)
  async deleteFile(job: Job<SendEmailJob>): Promise<void> {
    await this.transporter.sendMail(job.data);
  }
}
