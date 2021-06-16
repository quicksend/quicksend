import Joi from "joi";

import { Config } from "./config.interface";

export const configSchema = Joi.object<Config>({
  DATABASE_DEBUG: Joi.boolean().default(false),
  DATABASE_HOSTNAME: Joi.string().default("localhost"),
  DATABASE_NAME: Joi.string().default("quicksend"),
  DATABASE_PASSWORD: Joi.string().empty(null),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USERNAME: Joi.string().empty(null),

  NATS_URL: Joi.string().default("nats://localhost:4222"),

  PORT: Joi.number().port().default(3000),

  REDIS_HOSTNAME: Joi.string().default("localhost"),
  REDIS_PASSWORD: Joi.string().empty(null),
  REDIS_PORT: Joi.number().port().default(6379)
});
