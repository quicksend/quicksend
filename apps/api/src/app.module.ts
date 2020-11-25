import { APP_INTERCEPTOR } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { RateLimiterModule, RateLimiterInterceptor } from "nestjs-rate-limiter";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Queue } from "bull";
import { router, setQueues } from "bull-board";

import { AppController } from "./app.controller";

import { RateLimiterConfig } from "./common/config/ratelimiter.config";
import { SharedBullConfig } from "./common/config/shared-bull.config";
import { TypeOrmConfig } from "./common/config/typeorm.config";

import { SessionCheckMiddleware } from "./common/middlewares/session-check.middleware";

import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./file/file.module";
import { FolderModule } from "./folder/folder.module";
import { ItemModule } from "./item/item.module";
import { StorageModule } from "./storage/storage.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    AuthModule,

    BullModule.forRootAsync({
      useClass: SharedBullConfig
    }),

    FileModule,

    FolderModule,

    ItemModule,

    RateLimiterModule.registerAsync({
      useClass: RateLimiterConfig
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
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue("item") itemProcessor: Queue,
    @InjectQueue("storage") storageProcessor: Queue
  ) {
    setQueues([itemProcessor, storageProcessor]);
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SessionCheckMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: "*" });

    consumer.apply(router).forRoutes({ method: RequestMethod.ALL, path: "/" });
  }
}
