import path from "path";

import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { configFactory } from "./src/common/config/config.factory";

const { database } = configFactory();

export default {
  dbName: database.name,
  debug: process.env.NODE_ENV !== "production",
  driver: PostgreSqlDriver,
  entities: [path.join(__dirname, "./src/**/*.entity.ts")],
  host: database.hostname,
  password: database.password,
  port: database.port,
  user: database.username
} as Options;
