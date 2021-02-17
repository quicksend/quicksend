import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";

import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe
} from "@nestjs/common";

import { RateLimiterModule, RateLimiterInterceptor } from "nestjs-rate-limiter";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BullAdapter, router, setQueues } from "bull-board";
import { Queue } from "bull";

import { AppController } from "./app.controller";

import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { FileModule } from "./file/file.module";
import { FolderModule } from "./folder/folder.module";
import { ItemModule } from "./item/item.module";
import { StorageModule } from "./storage/storage.module";
import { UserModule } from "./user/user.module";

import { InternalServerErrorExceptionFilter } from "./common/exceptions/internal-server-error.exception";
import { MultiparterExceptionFilter } from "./common/exceptions/multiparter.exception";

import { SessionCheckMiddleware } from "./common/middlewares/session-check.middleware";

import { RatelimiterConfig } from "./config/modules/ratelimiter.config";
import { SharedBullConfig } from "./config/modules/shared-bull.config";
import { TypeOrmConfig } from "./config/modules/typeorm.config";

@Module({
  imports: [
    AuthModule,

    BullModule.forRootAsync({
      useClass: SharedBullConfig
    }),

    ConfigModule,

    FileModule,

    FolderModule,

    ItemModule,

    RateLimiterModule.registerAsync({
      useClass: RatelimiterConfig
    }),

    StorageModule,

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig
    }),

    UserModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: MultiparterExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true
        });
      }
    }
  ]
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue("item") itemProcessor: Queue,
    @InjectQueue("storage") storageProcessor: Queue
  ) {
    setQueues([
      new BullAdapter(itemProcessor),
      new BullAdapter(storageProcessor)
    ]);
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SessionCheckMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: "*" });

    consumer
      .apply(router)
      .forRoutes({ method: RequestMethod.ALL, path: "/queues" });
  }
}
