import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory
} from "nestjs-throttler";

import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

import { redisNamespace, throttlerNamespace } from "../config.namespaces";

@Injectable()
export class ThrottlerModuleConfig implements ThrottlerOptionsFactory {
  constructor(
    @Inject(redisNamespace.KEY)
    private readonly redisConfig: ConfigType<typeof redisNamespace>,

    @Inject(throttlerNamespace.KEY)
    private readonly throttlerConfig: ConfigType<typeof throttlerNamespace>
  ) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      limit: this.throttlerConfig.limit,
      ttl: this.throttlerConfig.ttl,
      storage: new ThrottlerStorageRedisService({
        host: this.redisConfig.hostname,
        password: this.redisConfig.password,
        port: this.redisConfig.port,
        username: this.redisConfig.username
      })
    };
  }
}
