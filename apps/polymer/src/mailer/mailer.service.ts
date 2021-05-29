import fs from "fs";
import path from "path";

import handlebars from "handlebars";
import mjml2html from "mjml";

import { BullAdapter } from "bull-board/bullAdapter";
import { BullBoard } from "@quicksend/bull-board";

import { ConfigService } from "@nestjs/config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";
import { SendMailOptions } from "nodemailer";
import { URL } from "url";

import { MailerProcessor } from "./mailer.processor";

import { Config } from "../common/config/config.interface";

import { SEND_EMAIL_JOB_NAME } from "./jobs/send-email.job";

export const TEMPLATE_DIRECTORY = path.join(__dirname, "./assets/emails");

@Injectable()
export class MailerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<Config>,

    @InjectQueue(MailerProcessor.QUEUE_NAME)
    private readonly mailerProcessor: Queue
  ) {}

  onModuleInit(): void {
    BullBoard.addQueues(new BullAdapter(this.mailerProcessor));
  }

  buildURL(relativePath: string): URL {
    const baseURL = this.configService.get("domain") as Config["domain"];

    return new URL(relativePath, baseURL);
  }

  async render(templateName: string, context = {}): Promise<string> {
    const location = path.join(TEMPLATE_DIRECTORY, `${templateName}.handlebars`);

    const mjml = await fs.promises.readFile(location, {
      encoding: "utf-8"
    });

    const template = handlebars.compile(mjml);

    const rendered = template(context);

    const { errors, html } = mjml2html(rendered, {
      actualPath: TEMPLATE_DIRECTORY
    });

    if (errors.length > 0) {
      throw new Error(errors.join("\n\n"));
    }

    return html;
  }

  async renderAndSend(templateName: string, options: SendMailOptions, context = {}): Promise<void> {
    const html = await this.render(templateName, context);

    return this.send({
      ...options,
      html
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.mailerProcessor.add(SEND_EMAIL_JOB_NAME, options);
  }
}
