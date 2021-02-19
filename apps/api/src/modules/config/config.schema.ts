import * as Joi from "joi";

import { ConfigEnvironment } from "./config.environment";

// prettier-ignore
export const ConfigSchema = Joi.object<ConfigEnvironment>({
  CLEANUP_FREQUENCY: Joi.number().min(0).default(60 * 1000),
  CLEANUP_LIMIT: Joi.number().min(0).default(250),

  BACKEND_DOMAIN: Joi.string().required(),
  FRONTEND_DOMAIN: Joi.string().required(),

  ENGINE_TYPE: Joi.string().default("disk"),

  DISK_ENGINE_UPLOAD_DIRECTORY: Joi.string().default("/uploads"),

  MAX_FILES: Joi.number().min(0).default(1),
  MAX_FILE_SIZE: Joi.number().min(0).default(100 * 1024 * 1024),

  PORT: Joi.number().default(3000),

  POSTGRES_HOSTNAME: Joi.string().default("localhost"),
  POSTGRES_NAME: Joi.string().default("quicksend"),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_PORT: Joi.number().min(0).max(65535).default(5432),
  POSTGRES_USERNAME: Joi.string().required(),

  RATELIMITER_THRESHOLD: Joi.number().min(0).default(250),
  RATELIMITER_TTL: Joi.number().min(0).default(60),

  REDIS_HOSTNAME: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().min(0).max(65535).default(6379),

  APPLICATIONS_SECRET: Joi.string().required(),
  RECAPTCHA_SECRET: Joi.string().required(),
  SESSIONS_SECRET: Joi.string().required(),

  SMTP_FROM: Joi.string().email().required(),
  SMTP_HOSTNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_PORT: Joi.number().min(0).max(65535).default(465),
  SMTP_SECURE: Joi.boolean().default(true),
  SMTP_TLS: Joi.boolean().default(true),
  SMTP_USERNAME: Joi.string().required()
});
