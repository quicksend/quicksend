import fs from "fs";

import toml from "@iarna/toml";

import { Config, configSchema } from "./config.schema";

export const loadTomlConfig = async (path?: string): Promise<Config> => {
  const result = await fs.promises
    .readFile(path || "gateway.cfg")
    .then((buffer) => buffer.toString())
    .then((raw) => toml.parse.async(raw))
    .then((config) => configSchema.safeParseAsync(config));

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
};
