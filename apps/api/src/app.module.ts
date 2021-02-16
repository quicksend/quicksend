import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";
import { ConfigType } from "@nestjs/config";
import { Inject } from "@nestjs/common";

import {
  Logger,
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

import { AppController } from "./app.controller";

import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { FileModule } from "./file/file.module";
import { FolderModule } from "./folder/folder.module";
import { ItemModule } from "./item/item.module";
import { StorageModule } from "./storage/storage.module";
import { UserModule } from "./user/user.module";

import { InternalServerErrorExceptionFilter } from "./common/exceptions/internal-server-error.exception";

import { SessionCheckMiddleware } from "./common/middlewares/session-check.middleware";

import { RatelimiterConfig } from "./config/modules/ratelimiter.config";
import { SharedBullConfig } from "./config/modules/shared-bull.config";
import { TypeOrmConfig } from "./config/modules/typeorm.config";

import { cleanupNamespace } from "./config/config.namespaces";

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
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor
    }
  ]
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    @Inject(cleanupNamespace.KEY)
    private readonly cleanupConfig: ConfigType<typeof cleanupNamespace>,

    @InjectQueue("item")
    private readonly itemProcessor: Queue,

    @InjectQueue("storage")
    private readonly storageProcessor: Queue
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
        threshold: this.cleanupConfig.limit
      },
      {
        removeOnComplete: true,
        repeat: {
          every: this.cleanupConfig.frequency
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
