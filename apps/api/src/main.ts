import * as helmet from "helmet";
import * as session from "express-session";

import * as Redis from "ioredis";
import * as RedisStore from "connect-redis";

import { ConfigType } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

import {
  domainsNamespace,
  httpNamespace,
  redisNamespace,
  secretsNamespace
} from "./config/config.namespaces";

const IS_PROD = process.env.NODE_ENV === "production";

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const domainsConfig = app.get<ConfigType<typeof domainsNamespace>>(
    domainsNamespace.KEY
  );

  const httpConfig = app.get<ConfigType<typeof httpNamespace>>(
    httpNamespace.KEY
  );

  const redisConfig = app.get<ConfigType<typeof redisNamespace>>(
    redisNamespace.KEY
  );

  const secretsConfig = app.get<ConfigType<typeof secretsNamespace>>(
    secretsNamespace.KEY
  );

  app.setGlobalPrefix("api");

  app.enableCors({
    credentials: true,
    origin: `${IS_PROD ? "https" : "http"}://${domainsConfig.frontend}`
  });

  app.use(helmet()).use(
    session({
      cookie: {
        maxAge: 14 * 8.64e7,
        sameSite: "strict",
        secure: IS_PROD
      },
      name: "sid.the.science.kid",
      resave: false,
      saveUninitialized: false,
      secret: secretsConfig.sessions,
      store: new (RedisStore(session))({
        client: new Redis({
          host: redisConfig.hostname,
          port: redisConfig.port
        })
      })
    })
  );

  app.listen(httpConfig.port, () => {
    Logger.log(`Listening on port ${httpConfig.port}`, "NestApplication");
  });
})();
