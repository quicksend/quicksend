import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { BullModule } from "@nestjs/bull";
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { HttpExceptionFilter, ValidationHttpExceptionFilter } from "@quicksend/common";

import { StorageModule } from "../storage/storage.module";

import { Config } from "../config/config.interface";

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

    StorageModule
  ],

  providers: [
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
    }
  ]
})
export class AppModule {}
