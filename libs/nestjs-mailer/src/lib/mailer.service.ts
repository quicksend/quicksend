import { Inject, Injectable } from "@nestjs/common";

import { SendMailOptions, Transporter, createTransport } from "nodemailer";

import { MAILER_MODULE_OPTIONS } from "./mailer.constants";

import { MailerModuleOptions } from "./mailer.interfaces";

@Injectable()
export class MailerService {
  readonly transporter: Transporter;

  constructor(
    @Inject(MAILER_MODULE_OPTIONS)
    mailerModuleOptions: MailerModuleOptions
  ) {
    this.transporter = createTransport(mailerModuleOptions);
  }

  send(options: SendMailOptions): Promise<void> {
    return this.transporter.sendMail(options);
  }
}
