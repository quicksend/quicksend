import Joi from "joi";

import { Config } from "./config.interface";

export const configSchema = Joi.object<Config>({
  NATS_URL: Joi.string().default("nats://localhost:4222"),

  PORT: Joi.number().port().default(3000)
});
