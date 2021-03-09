import { ConfigFactory, registerAs } from "@nestjs/config";

export interface ThrottlerConfig {
  limit: number;
  ttl: number;
}

export const throttlerNamespace = registerAs<ConfigFactory<ThrottlerConfig>>(
  "throttler",
  () => ({
    limit: +Number(process.env.THROTTLER_LIMIT) || 250,
    ttl: +Number(process.env.THROTTLER_TTL) || 60
  })
);
