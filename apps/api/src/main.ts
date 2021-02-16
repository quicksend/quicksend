import * as helmet from "helmet";
import * as session from "express-session";

import * as Redis from "ioredis";
import * as RedisStore from "connect-redis";

import { Logger, ValidationPipe } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

import {
  domainsNamespace,
  httpNamespace,
  redisNamespace,
  secretsNamespace
} from "./config/config.namespaces";

const IS_DEV = process.env.NODE_ENV === "development";

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
    origin: `${IS_DEV ? "http" : "https"}://${domainsConfig.frontend}`
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.use(helmet()).use(
    session({
      cookie: {
        domain: domainsConfig.backend,
        maxAge: 14 * 8.64e7,
        sameSite: "strict",
        secure: !IS_DEV
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

  app.listen(httpConfig.port, () =>
    Logger.log(`Listening on port ${httpConfig.port}`)
  );
})();
