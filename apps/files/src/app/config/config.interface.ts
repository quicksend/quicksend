export interface Config {
  DATABASE_DEBUG: boolean;
  DATABASE_HOSTNAME: string;
  DATABASE_NAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;

  NATS_URL: string;
}
