import { MailerModuleOptions } from "./mailer-module-options.interface";

export interface MailerModuleOptionsFactory {
  createMailerOptions(): Promise<MailerModuleOptions> | MailerModuleOptions;
}
