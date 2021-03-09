import { ConfigModule as BaseConfigModule } from "@nestjs/config";

import { Module } from "@nestjs/common";

import { ConfigSchema } from "./config.schema";

import {
  cleanupNamespace,
  domainsNamespace,
  httpNamespace,
  limitsNamespace,
  postgresNamespace,
  redisNamespace,
  secretsNamespace,
  smtpNamespace,
  storageNamespace,
  throttlerNamespace
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
        httpNamespace,
        limitsNamespace,
        postgresNamespace,
        redisNamespace,
        secretsNamespace,
        smtpNamespace,
        storageNamespace,
        throttlerNamespace
      ],
      validationSchema: ConfigSchema
    })
  ]
})
export class ConfigModule {}
