export interface ConfigEnvironment {
  CLEANUP_FREQUENCY: number;
  CLEANUP_LIMIT: number;

  BACKEND_DOMAIN: string;
  FRONTEND_DOMAIN: string;

  ENGINE_TYPE: string;

  DISK_ENGINE_UPLOAD_DIRECTORY: string;

  MAX_FILES: number;
  MAX_FILE_SIZE: number;

  PORT: number;

  POSTGRES_HOSTNAME: string;
  POSTGRES_NAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: number;
  POSTGRES_USERNAME: string;

  RATELIMITER_THRESHOLD: number;
  RATELIMITER_TTL: number;

  REDIS_HOSTNAME: string;
  REDIS_PORT: string;

  APPLICATIONS_SECRET: string;
  RECAPTCHA_SECRET: string;
  SESSIONS_SECRET: string;

  SMTP_FROM: string;
  SMTP_HOSTNAME: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: string;
  SMTP_SECURE: boolean;
  SMTP_TLS: boolean;
  SMTP_USERNAME: string;
}
