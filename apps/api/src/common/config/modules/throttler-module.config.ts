import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from "nestjs-throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

import { Config } from "../config.interface";

@Injectable()
export class ThrottlerModuleConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService<Config>) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const redis = this.configService.get("redis") as Config["redis"];
    const throttler = this.configService.get("throttler") as Config["throttler"];

    return {
      limit: throttler.limit,
      ttl: throttler.ttl,
      storage: new ThrottlerStorageRedisService({
        host: redis.hostname,
        password: redis.password,
        port: redis.port,
        username: redis.username
      })
    };
  }
}
