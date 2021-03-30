import Joi from "joi";

import { ConfigEnvironment } from "./config.environment";

// prettier-ignore
export const ConfigSchema = Joi.object<ConfigEnvironment>({
  CLEANUP_FREQUENCY: Joi.number().min(0).default(60 * 1000),
  CLEANUP_LIMIT: Joi.number().min(0).default(250),

  BACKEND_URL: Joi.string().uri(),
  FRONTEND_URL: Joi.string().uri(),

  STORAGE_MANAGER: Joi.string().default("disk"),

  DISK_MANAGER_UPLOAD_DIRECTORY: Joi.string().default("/uploads"),

  MAX_FILE_SIZE: Joi.number().min(0).default(100 * 1024 * 1024),

  PORT: Joi.number().default(3000),

  POSTGRES_HOSTNAME: Joi.string().default("localhost"),
  POSTGRES_NAME: Joi.string().default("quicksend"),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_PORT: Joi.number().min(0).max(65535).default(5432),
  POSTGRES_USERNAME: Joi.string().required(),

  REDIS_HOSTNAME: Joi.string().default("localhost"),
  REDIS_PASSWORD: Joi.string(),
  REDIS_PORT: Joi.number().min(0).max(65535).default(6379),
  REDIS_USERNAME: Joi.string(),

  RECAPTCHA_SECRET: Joi.string().required(),
  SESSIONS_SECRET: Joi.string().required(),

  SMTP_FROM: Joi.string().required(),
  SMTP_HOSTNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_PORT: Joi.number().min(0).max(65535).default(465),
  SMTP_SECURE: Joi.boolean().default(true),
  SMTP_USERNAME: Joi.string().required(),

  THROTTLER_LIMIT: Joi.number().min(0).default(250),
  THROTTLER_TTL: Joi.number().min(0).default(60)
});
