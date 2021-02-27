import { DynamicModule, Module, Provider } from "@nestjs/common";

import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";

import { MultiparterService } from "./multiparter.service";

import { MultiparterModuleAsyncOptions } from "./interfaces/multiparter-module-async-options.interface";
import { MultiparterModuleOptions } from "./interfaces/multiparter-module-options.interface";
import { MultiparterModuleOptionsFactory } from "./interfaces/multiparter-module-options-factory.interface";

import {
  MULTIPARTER_MODULE_ID,
  MULTIPARTER_MODULE_OPTIONS
} from "./multiparter.constants";

@Module({})
export class MultiparterModule {
  static register(options: MultiparterModuleOptions): DynamicModule {
    return {
      module: MultiparterModule,
      providers: [
        MultiparterService,
        {
          provide: MULTIPARTER_MODULE_OPTIONS,
          useValue: options
        },
        {
          provide: MULTIPARTER_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ],
      exports: [MultiparterService, MULTIPARTER_MODULE_OPTIONS]
    };
  }

  static registerAsync(options: MultiparterModuleAsyncOptions): DynamicModule {
    return {
      module: MultiparterModule,
      imports: options.imports,
      providers: [
        MultiparterService,
        ...this.createAsyncProviders(options),
        {
          provide: MULTIPARTER_MODULE_ID,
          useValue: randomStringGenerator()
        }
      ],
      exports: [MultiparterService, MULTIPARTER_MODULE_OPTIONS]
    };
  }

  private static createAsyncProviders(
    options: MultiparterModuleAsyncOptions
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
    options: MultiparterModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MULTIPARTER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: MULTIPARTER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MultiparterModuleOptionsFactory) => {
        return optionsFactory.createMultiparterOptions();
      },
      inject: [options.useExisting || options.useClass] as any
    };
  }
}
