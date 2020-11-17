import { APP_INTERCEPTOR } from "@nestjs/core";

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { UI as BullBoard } from "bull-board";
import { RateLimiterInterceptor, RateLimiterModule } from "nestjs-rate-limiter";

import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./file/file.module";
import { FolderModule } from "./folder/folder.module";
import { UserModule } from "./user/user.module";

import { RateLimiterConfig } from "./common/config/ratelimiter.config";
import { RedisConfig } from "./common/config/redis.config";
import { TypeOrmConfig } from "./common/config/typeorm.config";

import { SessionCheckMiddleware } from "./common/middlewares/session-check.middleware";

@Module({
  imports: [
    AuthModule,

    FileModule,

    FolderModule,

    RateLimiterModule.registerAsync({
      useClass: RateLimiterConfig
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig
    }),

    UserModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor
    },

    RedisConfig
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionCheckMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: "*" });

    consumer
      .apply(BullBoard)
      .forRoutes({ method: RequestMethod.ALL, path: "queues" });
  }
}
