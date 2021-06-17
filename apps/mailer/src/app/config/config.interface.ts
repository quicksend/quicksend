export interface Config {
  NATS_URL: string;

  REDIS_HOSTNAME: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;

  SMTP_FROM: string;
  SMTP_HOSTNAME: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
}
