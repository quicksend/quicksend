/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamicModule, Module, Provider } from "@nestjs/common";

import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";

import { MailerService } from "./mailer.service";

import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
  MailerModuleOptionsFactory
} from "./mailer.interfaces";

import { MAILER_MODULE_ID, MAILER_MODULE_OPTIONS } from "./mailer.constants";

@Module({
  exports: [MailerService, MAILER_MODULE_OPTIONS],
  providers: [MailerService]
})
export class MailerModule {
  static register(options: MailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: MAILER_MODULE_OPTIONS,
          useValue: options
        },
        {
          provide: MAILER_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ]
    };
  }

  static registerAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: MAILER_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ]
    };
  }

  private static createAsyncProviders(
    options: MailerModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as any,
        useClass: options.useClass as any
      }
    ];
  }

  private static createAsyncOptionsProvider(
    options: MailerModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MAILER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: MAILER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MailerModuleOptionsFactory) => {
        return optionsFactory.createMailerOptions();
      },
      inject: [options.useExisting || options.useClass] as any
    };
  }
}
