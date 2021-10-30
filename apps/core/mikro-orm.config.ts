import path from "path";

import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

export default {
  dbName: process.env.DATABASE_NAME,
  debug: true,
  driver: PostgreSqlDriver,
  entities: [
    path.join(__dirname, "./src/**/*.embeddable.ts"),
    path.join(__dirname, "./src/**/*.entity.ts")
  ],
  host: process.env.DATABASE_HOSTNAME,
  password: process.env.DATABASE_PASSWORD,
  port: +Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME
} as Options;
