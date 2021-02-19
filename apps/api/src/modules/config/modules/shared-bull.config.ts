import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import { SharedBullConfigurationFactory } from "@nestjs/bull";

import { QueueOptions } from "bull";

import { redisNamespace } from "../config.namespaces";

@Injectable()
export class SharedBullConfig implements SharedBullConfigurationFactory {
  constructor(
    @Inject(redisNamespace.KEY)
    private redisConfig: ConfigType<typeof redisNamespace>
  ) {}

  createSharedConfiguration(): QueueOptions {
    return {
      redis: {
        host: this.redisConfig.hostname,
        port: this.redisConfig.port
      }
    };
  }
}
