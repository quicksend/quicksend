import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import { SharedBullConfigurationFactory } from "@nestjs/bull";

import { QueueOptions } from "bull";

import { redisNamespace } from "../config.namespaces";

@Injectable()
export class SharedBullModuleConfig implements SharedBullConfigurationFactory {
  constructor(
    @Inject(redisNamespace.KEY)
    private readonly redisConfig: ConfigType<typeof redisNamespace>
  ) {}

  createSharedConfiguration(): QueueOptions {
    return {
      redis: {
        host: this.redisConfig.hostname,
        password: this.redisConfig.password,
        port: this.redisConfig.port,
        username: this.redisConfig.username
      }
    };
  }
}
