// MikroORM config for the CLI

import path from "path";

import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { configFactory } from "./src/common/config/config.factory";

const { database } = configFactory();

// If the project is running in a remote container, use the service name of postgres in the Dockerfile
if (process.env.REMOTE_CONTAINERS === "true") {
  database.hostname = "postgres";
}

export default {
  dbName: database.name,
  debug: true,
  driver: PostgreSqlDriver,
  entities: [
    path.join(__dirname, "./src/**/*.embeddable.ts"),
    path.join(__dirname, "./src/**/*.entity.ts")
  ],
  host: database.hostname,
  password: database.password,
  port: database.port,
  user: database.username
} as Options;
