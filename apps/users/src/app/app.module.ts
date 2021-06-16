import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { ClassSerializerInterceptor, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import {
  ValidationException,
  ValidationExceptionFilter
} from "../common/filters/validation-exception.filter";

import { Config } from "../config/config.interface";

import { UsersModule } from "../users/users.module";

import { configSchema } from "../config/config.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: configSchema
    }),

    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        autoLoadEntities: true,
        dbName: configService.get("DATABASE_NAME"),
        debug: configService.get("DATABASE_DEBUG"),
        driver: PostgreSqlDriver,
        host: configService.get("DATABASE_HOSTNAME"),
        password: configService.get("DATABASE_PASSWORD"),
        port: configService.get("DATABASE_PORT"),
        user: configService.get("DATABASE_USERNAME")
      })
    }),

    ScheduleModule.forRoot(),

    UsersModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
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
