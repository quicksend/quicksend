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

import { InternalServerErrorExceptionFilter } from "./common/filters/internal-server-error.filter";

import { SessionCheckMiddleware } from "./common/middlewares/session-check.middleware";

import { ApplicationsModule } from "./modules/applications/applications.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from "./modules/config/config.module";
import { FilesModule } from "./modules/files/files.module";
import { FoldersModule } from "./modules/folders/folders.module";
import { ItemsModule } from "./modules/items/items.module";
import { StorageModule } from "./modules/storage/storage.module";
import { UserModule } from "./modules/user/user.module";

import { RatelimiterConfig } from "./modules/config/modules/ratelimiter.config";
import { SharedBullConfig } from "./modules/config/modules/shared-bull.config";
import { TypeOrmConfig } from "./modules/config/modules/typeorm.config";

@Module({
  imports: [
    ApplicationsModule,

    AuthModule,

    BullModule.forRootAsync({
      useClass: SharedBullConfig
    }),

    ConfigModule,

    FilesModule,

    FoldersModule,

    ItemsModule,

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
      .forRoutes({ method: RequestMethod.ALL, path: "bull" });
  }
}
