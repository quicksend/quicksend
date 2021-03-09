import { ConfigFactory, registerAs } from "@nestjs/config";

import { DiskManagerOptions } from "@quicksend/transmit";

export interface EngineConfig {
  manager: string;
  options: {
    disk: DiskManagerOptions;
  };
}

export const storageNamespace = registerAs<ConfigFactory<EngineConfig>>(
  "storage",
  () => ({
    manager: process.env.STORAGE_MANAGER || "disk",
    options: {
      disk: {
        directory: process.env.DISK_ENGINE_UPLOAD_DIRECTORY || "/uploads"
      }
    }
  })
);
