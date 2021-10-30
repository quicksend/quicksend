import * as rfs from "rotating-file-stream";

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import {
  ClassSerializerInterceptor,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";

import { ValidationExceptionFilter, ValidationPipe } from "@quicksend/common";

import { ExpressParser } from "@ogma/platform-express";
import { NatsParser } from "@ogma/platform-nats";
import { OgmaInterceptor, OgmaModule } from "@ogma/nestjs-module";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";
import { RequestContextMiddleware } from "@alexy4744/nestjs-request-context";

import { NATS_CLIENT } from "./app.constants";

import { AppController } from "./app.controller";

import { RequestContext } from "./common/contexts/request.context";

import { Config } from "./common/config/config.schema";
import { loadTomlConfig } from "./common/config/config.loader";

import { ExceptionFilter } from "./common/filters/exception.filter";

import { generateLogFilename } from "./common/utils/generate-log-filename.util";

import { ApplicationsModule } from "./applications/applications.module";
import { AuthModule } from "./auth/auth.module";
import { ItemsModule } from "./items/items.module";
import { UsersModule } from "./users/users.module";

@Global()
@Module({
  imports: [
    ApplicationsModule,

    AuthModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadTomlConfig]
    }),

    ItemsModule,

    OgmaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        service: {
          color: true,
          context: "Gateway",
          stream: rfs.createStream(generateLogFilename, {
            interval: "1d",
            path: configService.get("logs").directory,
            teeToStdout: true
          })
        },
        interceptor: {
          http: ExpressParser,
          rpc: NatsParser
        }
      })
    }),

    UsersModule
  ],
  controllers: [AppController],
  exports: [NATS_CLIENT],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor
    },
    {
      provide: APP_PIPE,
      useFactory: ValidationPipe
    },
    {
      provide: NATS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>): NatsClient => {
        return new NatsClient({
          connection: {
            pass: configService.get("nats").password,
            servers: configService.get("nats").servers,
            user: configService.get("nats").username
          }
        });
      }
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware(RequestContext)).forRoutes({
      method: RequestMethod.ALL,
      path: "*"
    });
  }
}
