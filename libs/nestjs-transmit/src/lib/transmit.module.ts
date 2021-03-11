/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamicModule, Module, Provider } from "@nestjs/common";

import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";

import { TransmitService } from "./transmit.service";

import {
  TransmitModuleAsyncOptions,
  TransmitModuleOptions,
  TransmitModuleOptionsFactory
} from "./transmit.interfaces";

import {
  TRANSMIT_MODULE_ID,
  TRANSMIT_MODULE_OPTIONS
} from "./transmit.constants";

@Module({
  exports: [TransmitService, TRANSMIT_MODULE_OPTIONS],
  providers: [TransmitService]
})
export class TransmitModule {
  static register(options: TransmitModuleOptions): DynamicModule {
    return {
      module: TransmitModule,
      providers: [
        {
          provide: TRANSMIT_MODULE_OPTIONS,
          useValue: options
        },
        {
          provide: TRANSMIT_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ]
    };
  }

  static registerAsync(options: TransmitModuleAsyncOptions): DynamicModule {
    return {
      module: TransmitModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: TRANSMIT_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ]
    };
  }

  private static createAsyncProviders(
    options: TransmitModuleAsyncOptions
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
    options: TransmitModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TRANSMIT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: TRANSMIT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TransmitModuleOptionsFactory) => {
        return optionsFactory.createTransmitOptions();
      },
      inject: [options.useExisting || options.useClass] as any
    };
  }
}
