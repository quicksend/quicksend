import { ConfigFactory, registerAs } from "@nestjs/config";

export interface PostgresConfig {
  hostname: string;
  name: string;
  password: string;
  port: number;
  username: string;
}

export const postgresNamespace = registerAs<ConfigFactory<PostgresConfig>>(
  "postgres",
  () => ({
    hostname: process.env.POSTGRES_HOSTNAME || "localhost",
    name: process.env.POSTGRES_NAME || "quicksend",
    password: process.env.POSTGRES_PASSWORD!,
    port: +Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USERNAME!
  })
);
