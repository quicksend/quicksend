import { ConfigModule as BaseConfigModule } from "@nestjs/config";

import { Module } from "@nestjs/common";

import { ConfigSchema } from "./config.schema";

import {
  cleanupNamespace,
  domainsNamespace,
  engineNamespace,
  httpNamespace,
  limitsNamespace,
  postgresNamespace,
  ratelimiterNamespace,
  redisNamespace,
  secretsNamespace,
  smtpNamespace
} from "./config.namespaces";

const IS_PROD = process.env.NODE_ENV === "production";

@Module({
  imports: [
    BaseConfigModule.forRoot({
      cache: true,
      envFilePath: `.env.${IS_PROD ? "production" : "development"}`,
      expandVariables: true,
      isGlobal: true,
      load: [
        cleanupNamespace,
        domainsNamespace,
        engineNamespace,
        httpNamespace,
        limitsNamespace,
        postgresNamespace,
        ratelimiterNamespace,
        redisNamespace,
        secretsNamespace,
        smtpNamespace
      ],
      validationSchema: ConfigSchema
    })
  ]
})
export class ConfigModule {}
