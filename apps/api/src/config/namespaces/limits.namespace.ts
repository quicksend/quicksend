import { ConfigFactory, registerAs } from "@nestjs/config";

export interface LimitsConfig {
  maxFileSize: number;
}

export const limitsNamespace = registerAs<ConfigFactory<LimitsConfig>>(
  "limits",
  () => ({
    maxFileSize: +Number(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024
  })
);
