import { ConfigFactory, registerAs } from "@nestjs/config";

export interface LimitsConfig {
  maxFiles: number;
  maxFileSize: number;
}

export const limitsNamespace = registerAs<ConfigFactory<LimitsConfig>>(
  "limits",
  () => ({
    maxFiles: +Number(process.env.MAX_FILES) || 100 * 1024 * 1024,
    maxFileSize: +Number(process.env.MAX_FILE_SIZE) || 1
  })
);
