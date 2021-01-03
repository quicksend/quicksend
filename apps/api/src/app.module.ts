import { APP_INTERCEPTOR } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod
} from "@nestjs/common";

import { RateLimiterModule, RateLimiterInterceptor } from "nestjs-rate-limiter";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BullAdapter, router, setQueues } from "bull-board";
import { Queue } from "bull";

import { config } from "@quicksend/config";

import { AppController } from "./app.controller";

import { RateLimiterConfig } from "./common/configs/ratelimiter.config";
import { SharedBullConfig } from "./common/configs/shared-bull.config";
import { TypeOrmConfig } from "./common/configs/typeorm.config";

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
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    @InjectQueue("item") private readonly itemProcessor: Queue,
    @InjectQueue("storage") private readonly storageProcessor: Queue
  ) {
    setQueues([
      new BullAdapter(this.itemProcessor),
      new BullAdapter(this.storageProcessor)
    ]);
  }

  async onModuleInit(): Promise<void> {
    await this.itemProcessor.removeJobs("*");
    await this.itemProcessor.add(
      "deleteOrphanedItems",
      {
        threshold: config.get("advanced").garbageCollector.threshold
      },
      {
        removeOnComplete: true,
        repeat: {
          every: config.get("advanced").garbageCollector.frequency
        }
      }
    );
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SessionCheckMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: "*" });

    consumer.apply(router).forRoutes({ method: RequestMethod.ALL, path: "/" });
  }
}
