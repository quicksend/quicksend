import { ConfigType } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";

import {
  MailerModuleOptions,
  MailerModuleOptionsFactory
} from "@quicksend/nestjs-mailer";

import { smtpNamespace } from "../../config/config.namespaces";

@Injectable()
export class MailerModuleConfig implements MailerModuleOptionsFactory {
  constructor(
    @Inject(smtpNamespace.KEY)
    private readonly smtpConfig: ConfigType<typeof smtpNamespace>
  ) {}

  createMailerOptions(): MailerModuleOptions {
    return {
      auth: {
        pass: this.smtpConfig.password,
        user: this.smtpConfig.username
      },
      from: this.smtpConfig.from,
      host: this.smtpConfig.hostname,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure
    };
  }
}
