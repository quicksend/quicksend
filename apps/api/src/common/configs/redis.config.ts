import { RedisOptions } from "ioredis";

import { Injectable } from "@nestjs/common";

import { config } from "@quicksend/config";

@Injectable()
export class RedisConfig implements RedisOptions {
  host = config.get("redis").hostname;

  port = config.get("redis").port;
}
