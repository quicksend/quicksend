import { ConfigFactory, registerAs } from "@nestjs/config";

export interface RedisConfig {
  hostname: string;
  port: number;
}

export const redisNamespace = registerAs<ConfigFactory<RedisConfig>>(
  "redis",
  () => ({
    hostname: process.env.REDIS_HOSTNAME || "localhost",
    port: +Number(process.env.REDIS_PORT) || 6379
  })
);
