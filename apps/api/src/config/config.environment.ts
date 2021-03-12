export interface ConfigEnvironment {
  CLEANUP_FREQUENCY: number;
  CLEANUP_LIMIT: number;

  BACKEND_URL: string;
  FRONTEND_URL: string;

  STORAGE_MANAGER: string;

  DISK_MANAGER_UPLOAD_DIRECTORY: string;

  MAX_FILE_SIZE: number;

  PORT: number;

  POSTGRES_HOSTNAME: string;
  POSTGRES_NAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: number;
  POSTGRES_USERNAME: string;

  REDIS_HOSTNAME: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: string;
  REDIS_USERNAME: string;

  RECAPTCHA_SECRET: string;
  SESSIONS_SECRET: string;

  SMTP_FROM: string;
  SMTP_HOSTNAME: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: string;
  SMTP_SECURE: boolean;
  SMTP_USERNAME: string;

  THROTTLER_LIMIT: number;
  THROTTLER_TTL: number;
}
