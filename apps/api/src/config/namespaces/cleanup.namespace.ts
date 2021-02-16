import { ConfigFactory, registerAs } from "@nestjs/config";

export interface CleanupConfig {
  frequency: number;
  limit: number;
}

export const cleanupNamespace = registerAs<ConfigFactory<CleanupConfig>>(
  "cleanup",
  () => ({
    frequency: +Number(process.env.CLEANUP_FREQUENCY) || 60 * 1000,
    limit: +Number(process.env.CLEANUP_THRESHOLD) || 250
  })
);
