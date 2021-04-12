import Joi from "joi";

import { Config } from "./config.interface";

export const configSchema = Joi.object<Config>({
  database: Joi.object<Config["database"]>({
    debug: Joi.boolean().default(false),
    hostname: Joi.string().default("localhost"),
    name: Joi.string().default("quicksend"),
    password: Joi.string().empty(null),
    port: Joi.number().min(0).max(65535).default(5432),
    username: Joi.string().empty(null)
  }),

  limits: Joi.object<Config["limits"]>({
    maxFileSize: Joi.number()
      .min(0)
      .default(100 * 1024 * 1024)
  }),

  port: Joi.number().min(0).max(65535).default(3000),

  purge: Joi.object<Config["purge"]>({
    limit: Joi.number().min(0).default(500)
  }),

  recaptcha: Joi.object<Config["recaptcha"]>({
    secret: Joi.string().required(),
    url: Joi.string().uri().default("https://www.recaptcha.net")
  }),

  redis: Joi.object<Config["redis"]>({
    hostname: Joi.string().default("localhost"),
    password: Joi.string().empty(null),
    port: Joi.number().min(0).max(65535).default(6379),
    username: Joi.string().empty(null)
  }),

  secrets: Joi.object<Config["secrets"]>({
    sessions: Joi.string().required()
  }),

  smtp: Joi.object<Config["smtp"]>({
    from: Joi.string().required(),
    hostname: Joi.string().required(),
    password: Joi.string().required(),
    port: Joi.number().min(0).max(65535).default(465),
    secure: Joi.boolean().default(true),
    username: Joi.string().required()
  }),

  storage: Joi.object<Config["storage"]>({
    manager: Joi.string().default("disk"),
    options: Joi.object().default({
      directory: "./uploads"
    })
  }),

  throttler: Joi.object<Config["throttler"]>({
    limit: Joi.number().min(0).default(100),
    ttl: Joi.number().min(0).default(60000)
  }),

  urls: Joi.object<Config["urls"]>({
    backend: Joi.string().uri().required(),
    frontend: Joi.string().uri().required()
  })
});
