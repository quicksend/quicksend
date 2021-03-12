/* eslint-disable @typescript-eslint/no-explicit-any */

import { ModuleMetadata } from "@nestjs/common/interfaces";
import { Type } from "@nestjs/common";

import { MailerModuleOptions } from "./mailer-module-options.interface";
import { MailerModuleOptionsFactory } from "./mailer-module-options-factory.interface";

// prettier-ignore
export interface MailerModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<MailerModuleOptionsFactory>;
  useClass?: Type<MailerModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MailerModuleOptions> | MailerModuleOptions;
  inject?: any[];
}
