import * as Redis from "ioredis";

import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import {
  RateLimiterOptions,
  RateLimiterOptionsFactory
} from "nestjs-rate-limiter";

import { ratelimiterNamespace, redisNamespace } from "../config.namespaces";

@Injectable()
export class RatelimiterConfig implements RateLimiterOptionsFactory {
  constructor(
    @Inject(ratelimiterNamespace.KEY)
    private ratelimiterConfig: ConfigType<typeof ratelimiterNamespace>,

    @Inject(redisNamespace.KEY)
    private redisConfig: ConfigType<typeof redisNamespace>
  ) {}

  createRateLimiterOptions(): RateLimiterOptions {
    return {
      errorMessage: "You are sending requests too fast, please slow down!",
      duration: this.ratelimiterConfig.ttl,
      for: "Express",
      points: this.ratelimiterConfig.threshold,
      pointsConsumed: 1,
      storeClient: new Redis({
        host: this.redisConfig.hostname,
        port: this.redisConfig.port
      }),
      type: "Redis"
    };
  }
}
