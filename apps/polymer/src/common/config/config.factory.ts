import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { Config } from "./config.interface";

import { configSchema } from "./config.schema";

export const YAML_CONFIG_FILENAME = "config.yml";
export const YAML_CONFIG_DESTINATION = path.join("./apps/polymer", YAML_CONFIG_FILENAME);

export const configFactory = (): Config => {
  const raw = yaml.load(fs.readFileSync(YAML_CONFIG_DESTINATION, "utf8"));

  const { error, value } = configSchema.validate(raw, {
    abortEarly: false
  });

  if (error) {
    throw new Error(error.annotate());
  }

  return value as Config;
};
