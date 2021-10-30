import fs from "fs";
import path from "path";

import handlebars from "handlebars";
import mjml2html from "mjml";

import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";
import { SendMailOptions } from "nodemailer";

import { MailerProcessor } from "./mailer.processor";

import { EmailTemplates } from "./enums/email-templates.enum";

import { SEND_EMAIL } from "./jobs/send-email.job";

export const TEMPLATE_DIRECTORY = path.join(__dirname, "../../assets/emails");

@Injectable()
export class MailerService {
  constructor(
    @InjectQueue(MailerProcessor.QUEUE_NAME)
    private readonly mailerProcessor: Queue
  ) {}

  async render(template: EmailTemplates[number], context = {}): Promise<string> {
    const templatePath = path.join(TEMPLATE_DIRECTORY, `${template}.handlebars`);

    const { errors, html } = await fs.promises
      .readFile(templatePath)
      .then((buffer) => buffer.toString())
      .then((raw) => handlebars.compile(raw))
      .then((renderer) => renderer(context))
      .then((rendered) => mjml2html(rendered, { actualPath: TEMPLATE_DIRECTORY }));

    if (errors.length > 0) {
      throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
    }

    return html;
  }

  async renderAndSend(
    template: EmailTemplates,
    context: Record<string, unknown>,
    options: SendMailOptions
  ): Promise<void> {
    const html = await this.render(template, context);

    return this.send({
      ...options,
      html
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.mailerProcessor.add(SEND_EMAIL, options);
  }
}
