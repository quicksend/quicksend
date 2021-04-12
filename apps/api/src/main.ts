import helmet from "helmet";
import session from "express-session";

import Redis from "ioredis";
import RedisStore from "connect-redis";

import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app/app.module";

import { Config } from "./common/config/config.interface";

(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get<ConfigService<Config>>(ConfigService);

  const redis = config.get("redis") as Config["redis"];
  const secrets = config.get("secrets") as Config["secrets"];
  const urls = config.get("urls") as Config["urls"];

  app.setGlobalPrefix("api");

  app.enableCors({
    credentials: true,
    origin: urls.frontend
  });

  app.use(helmet());

  app.use(
    session({
      cookie: {
        maxAge: 14 * 8.64e7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      },
      name: "sid.the.science.kid",
      resave: false,
      saveUninitialized: false,
      secret: secrets.sessions,
      store: new (RedisStore(session))({
        client: new Redis(redis)
      })
    })
  );

  app
    .listen(config.get("port") as number)
    .then(() => app.getUrl())
    .then((url) => Logger.log(`Listening on ${url}`, "NestApplication"));
})();
