import { Injectable } from "@nestjs/common";
import { SharedBullConfigurationFactory } from "@nestjs/bull";

import { QueueOptions } from "bull";

import { RedisConfig } from "./redis.config";

@Injectable()
export class SharedBullConfig implements SharedBullConfigurationFactory {
  createSharedConfiguration(): QueueOptions {
    return {
      redis: new RedisConfig()
    };
  }
}
