import { ConfigFactory, registerAs } from "@nestjs/config";

import { DiskStorageEngineOptions } from "@quicksend/multiparter";

export interface EngineConfig {
  options: {
    disk: DiskStorageEngineOptions;
  };
  type: string;
}

export const engineNamespace = registerAs<ConfigFactory<EngineConfig>>(
  "engine",
  () => ({
    options: {
      disk: {
        directory: process.env.DISK_ENGINE_UPLOAD_DIRECTORY || "/uploads"
      }
    },
    type: process.env.ENGINE_TYPE || "disk"
  })
);
