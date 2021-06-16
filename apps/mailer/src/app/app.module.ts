import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { Config } from "../config/config.interface";

import { MailerModule } from "../mailer/mailer.module";

import { configSchema } from "../config/config.schema";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        redis: {
          host: configService.get("REDIS_HOSTNAME"),
          password: configService.get("REDIS_PASSWORD"),
          port: configService.get("REDIS_PORT")
        }
      })
    }),

    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: configSchema
    }),

    MailerModule
  ],
  providers: []
})
export class AppModule {}
