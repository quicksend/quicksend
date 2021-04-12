import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { SharedBullConfigurationFactory } from "@nestjs/bull";

import { QueueOptions } from "bull";

import { Config } from "../config.interface";

@Injectable()
export class SharedBullModuleConfig implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService<Config>) {}

  createSharedConfiguration(): QueueOptions {
    const redis = this.configService.get("redis") as Config["redis"];

    return {
      redis: {
        host: redis.hostname,
        password: redis.password,
        port: redis.port,
        username: redis.username
      }
    };
  }
}
