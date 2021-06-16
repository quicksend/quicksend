import { APP_FILTER, APP_PIPE } from "@nestjs/core";

import { ConfigModule } from "@nestjs/config";
import { Module, ValidationPipe } from "@nestjs/common";

import { AllExceptionsFilter } from "../common/filters/all-exception.filter";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  ValidationException,
  ValidationExceptionFilter
} from "../common/filters/validation-exception.filter";

import { UsersModule } from "../users/users.module";

import { AppController } from "./app.controller";

import { configSchema } from "../config/config.schema";

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
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        exceptionFactory: (errors): ValidationException => new ValidationException(errors),
        transform: true,
        validationError: {
          target: false,
          value: false
        },
        whitelist: true
      })
    }
  ]
})
export class AppModule {}
