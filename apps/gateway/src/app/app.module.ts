import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { ConfigModule } from "@nestjs/config";
import { ClassSerializerInterceptor, Module } from "@nestjs/common";

import {
  HttpExceptionFilter,
  ValidationHttpExceptionFilter,
  ValidationPipe
} from "@quicksend/common";

import { AllExceptionFilter } from "./common/filters/all-exception.filter";

import { AppController } from "./app.controller";

import { UsersModule } from "./users/users.module";

import { configSchema } from "./config/config.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: configSchema
    }),

    UsersModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationHttpExceptionFilter
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
