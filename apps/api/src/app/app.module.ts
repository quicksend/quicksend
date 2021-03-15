import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";

import {
  ClassSerializerInterceptor,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { ThrottlerGuard, ThrottlerModule } from "nestjs-throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MailerModule } from "@quicksend/nestjs-mailer";

import {
  RequestContextInterceptor,
  RequestContextModule
} from "@quicksend/nestjs-request-context";

import { BullAdapter, router, setQueues } from "bull-board";
import { Queue } from "bull";

import { AppController } from "./app.controller";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";
import { ThrottlerExceptionFilter } from "../common/filters/throttler-exception.filter";
import { ValidationExceptionFilter } from "../common/filters/validation-exception.filter";

import { RequestContext } from "../common/classes/request-context";

import { SessionCheckMiddleware } from "../common/middlewares/session-check.middleware";

import { ValidationPipe } from "../common/pipes/validation.pipe";

import { ApplicationsModule } from "../applications/applications.module";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "../config/config.module";
import { FilesModule } from "../files/files.module";
import { FoldersModule } from "../folders/folders.module";
import { ItemsModule } from "../items/items.module";
import { StorageModule } from "../storage/storage.module";
import { TransactionModule } from "../transaction/transaction.module";
import { UserModule } from "../user/user.module";

import { MailerModuleConfig } from "../config/modules/mailer-module.config";
import { SharedBullModuleConfig } from "../config/modules/shared-bull-module.config";
import { ThrottlerModuleConfig } from "../config/modules/throttler-module.config";
import { TypeOrmModuleConfig } from "../config/modules/typeorm-module.config";

import { ItemsProcessor } from "../items/items.processor";
import { StorageProcessor } from "../storage/storage.processor";

import { TransactionInterceptor } from "../transaction/transaction.interceptor";

@Global()
@Module({
  imports: [
    ApplicationsModule,

    AuthModule,

    BullModule.forRootAsync({
      useClass: SharedBullModuleConfig
    }),

    ConfigModule,

    FilesModule,

    FoldersModule,

    ItemsModule,

    MailerModule.registerAsync({
      useClass: MailerModuleConfig
    }),

    RequestContextModule.register({
      context: RequestContext
    }),

    StorageModule,

    ThrottlerModule.forRootAsync({
      useClass: ThrottlerModuleConfig
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmModuleConfig
    }),

    TransactionModule,

    UserModule
  ],
  controllers: [AppController],
  exports: [MailerModule, TransactionModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor()
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor()
    },
    {
      provide: APP_PIPE,
      useFactory: ValidationPipe
    }
  ]
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue(ItemsProcessor.QUEUE_NAME) itemProcessor: Queue,
    @InjectQueue(StorageProcessor.QUEUE_NAME) storageProcessor: Queue
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
