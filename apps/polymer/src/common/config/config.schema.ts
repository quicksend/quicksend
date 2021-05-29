import Joi from "joi";

import { Config } from "./config.interface";

export const configSchema = Joi.object<Config>({
  database: Joi.object<Config["database"]>({
    debug: Joi.boolean().default(false),
    hostname: Joi.string().default("localhost"),
    name: Joi.string().default("quicksend"),
    password: Joi.string().empty(null),
    port: Joi.number().port().default(5432),
    username: Joi.string().empty(null)
  }),

  domain: Joi.string().uri(),

  port: Joi.number().port().default(3000),

  purge: Joi.object<Config["purge"]>({
    limit: Joi.number().positive().default(500)
  }),

  recaptcha: Joi.object<Config["recaptcha"]>({
    secret: Joi.string().required(),
    url: Joi.string().uri().default("https://www.recaptcha.net")
  }),

  redis: Joi.object<Config["redis"]>({
    hostname: Joi.string().default("localhost"),
    password: Joi.string().empty(null),
    port: Joi.number().port().default(6379)
  }),

  secrets: Joi.object<Config["secrets"]>({
    sessions: Joi.string().required()
  }),

  smtp: Joi.object<Config["smtp"]>({
    from: Joi.string().required(),
    hostname: Joi.string().required(),
    password: Joi.string().required(),
    port: Joi.number().port().default(465),
    secure: Joi.boolean().default(true),
    username: Joi.string().required()
  }),

  storage: Joi.object<Config["storage"]>({
    manager: Joi.string().default("disk").valid("disk"),
    maxFileSize: Joi.number()
      .positive()
      .default(100 * 1024 * 1024),
    options: Joi.object().default({
      directory: "./uploads"
    })
  }),

  throttler: Joi.object<Config["throttler"]>({
    limit: Joi.number().positive().default(100),
    ttl: Joi.number().positive().default(60000)
  })
});
