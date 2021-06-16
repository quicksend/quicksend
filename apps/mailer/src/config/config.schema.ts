import Joi from "joi";

import { Config } from "./config.interface";

export const configSchema = Joi.object<Config>({
  NATS_URL: Joi.string().default("nats://localhost:4222"),

  REDIS_HOSTNAME: Joi.string().default("localhost"),
  REDIS_PASSWORD: Joi.string().empty(null),
  REDIS_PORT: Joi.number().port().default(6379),

  SMTP_FROM: Joi.string().required(),
  SMTP_HOSTNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_PORT: Joi.number().port().default(465),
  SMTP_USERNAME: Joi.string().required()
});
