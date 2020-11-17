import * as Redis from "ioredis";

import { Injectable } from "@nestjs/common";

import {
  RateLimiterOptions,
  RateLimiterOptionsFactory
} from "nestjs-rate-limiter";

import { config } from "@quicksend/config";

@Injectable()
export class RateLimiterConfig implements RateLimiterOptionsFactory {
  createRateLimiterOptions(): RateLimiterOptions {
    return {
      errorMessage: "You are sending requests too fast, please slow down!",
      duration: config.get("throttler").ttl,
      for: "Express",
      points: config.get("throttler").limit,
      pointsConsumed: 1,
      storeClient: new Redis({
        host: config.get("redis").hostname,
        port: config.get("redis").port
      }),
      type: "Redis"
    };
  }
}
