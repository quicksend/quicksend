import { ConfigFactory, registerAs } from "@nestjs/config";

export interface RatelimiterConfig {
  threshold: number;
  ttl: number;
}

export const ratelimiterNamespace = registerAs<
  ConfigFactory<RatelimiterConfig>
>("ratelimiter", () => ({
  threshold: +Number(process.env.RATELIMITER_THRESHOLD) || 250,
  ttl: +Number(process.env.RATELIMITER_TTL) || 60
}));
