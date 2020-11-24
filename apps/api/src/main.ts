import * as helmet from "helmet";
import * as session from "express-session";

import * as Redis from "ioredis";
import * as RedisStore from "connect-redis";

import { URL } from "url";

import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe
} from "@nestjs/common";

import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory, Reflector } from "@nestjs/core";

import { config } from "@quicksend/config";

import { RedisConfig } from "./common/config/redis.config";

import { InternalServerErrorExceptionFilter } from "./common/exceptions/internal-server-error.exception";

import { AppModule } from "./app.module";

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isDev = config.get("env") === "development";
  const port = config.get("port");

  app.setGlobalPrefix("api");

  app.enableCors({
    credentials: true,
    origin: `${isDev ? "http" : "https"}://${config.get("domains").frontend}`
  });

  app
    .useGlobalFilters(new InternalServerErrorExceptionFilter(Logger))
    .useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.use(helmet()).use(
    session({
      cookie: {
        domain: new URL(config.get("domains").backend).hostname,
        maxAge: 14 * 8.64e7,
        sameSite: "strict",
        secure: !isDev
      },
      name: "sid.the.science.kid",
      resave: false,
      saveUninitialized: false,
      secret: config.get("secrets").sessions,
      store: new (RedisStore(session))({
        client: new Redis(new RedisConfig())
      })
    })
  );

  app.listen(port, () => Logger.log(`Listening on port ${port}`));
})();
