import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule } from "@nestjs/bull";
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import {
  RpcExceptionFilter,
  ValidationPipe,
  ValidationRpcExceptionFilter
} from "@quicksend/common";

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
  providers: [
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationRpcExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_PIPE,
      useFactory: ValidationPipe
    }
  ]
})
export class AppModule {}
