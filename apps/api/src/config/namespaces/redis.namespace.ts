import { ConfigFactory, registerAs } from "@nestjs/config";

export interface RedisConfig {
  hostname: string;
  password?: string;
  port: number;
  username?: string;
}

export const redisNamespace = registerAs<ConfigFactory<RedisConfig>>(
  "redis",
  () => ({
    hostname: process.env.REDIS_HOSTNAME || "localhost",
    password: process.env.REDIS_PASSWORD,
    port: +Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME
  })
);
