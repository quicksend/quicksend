import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule, InjectQueue } from "@nestjs/bull";

import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "nestjs-throttler";

import { BullAdapter, router as BullBoard, setQueues } from "bull-board";
import { Queue } from "bull";

import { EntityManagerContextMiddleware } from "../common/middlewares/entity-manager-context.middleware";
import { SessionCheckMiddleware } from "../common/middlewares/session-check.middleware";

import { ValidationPipe } from "../common/pipes/validation.pipe";

import { ApplicationsModule } from "../applications/applications.module";
import { AuthModule } from "../auth/auth.module";
import { FilesModule } from "../files/files.module";
import { FoldersModule } from "../folders/folders.module";
import { MailerModule } from "../mailer/mailer.module";
import { RepositoriesModule } from "../repositories/repositories.module";
import { StorageModule } from "../storage/storage.module";
import { UserModule } from "../user/user.module";

import { MailerProcessor } from "../mailer/mailer.processor";
import { StorageProcessor } from "../storage/storage.processor";

import { MikroOrmModuleConfig } from "../common/config/modules/mikro-orm-module.config";
import { SharedBullModuleConfig } from "../common/config/modules/shared-bull-module.config";
import { ThrottlerModuleConfig } from "../common/config/modules/throttler-module.config";

import { AllExceptionsFilter } from "../common/filters/all-exception.filter";
import { ThrottlerExceptionFilter } from "../common/filters/throttler-exception.filter";
import { ValidationExceptionFilter } from "../common/filters/validation-exception.filter";

import { configFactory } from "../common/config/config.factory";

@Module({
  imports: [
    ApplicationsModule,

    AuthModule,

    BullModule.forRootAsync({
      useClass: SharedBullModuleConfig
    }),

    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configFactory]
    }),

    FilesModule,

    FoldersModule,

    MailerModule,

    MikroOrmModule.forRootAsync({
      useClass: MikroOrmModuleConfig
    }),

    RepositoriesModule,

    ScheduleModule.forRoot(),

    StorageModule,

    ThrottlerModule.forRootAsync({
      useClass: ThrottlerModuleConfig
    }),

    UserModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
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
      provide: APP_PIPE,
      useFactory: ValidationPipe
    }
  ]
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue(MailerProcessor.QUEUE_NAME) mailerProcessor: Queue,
    @InjectQueue(StorageProcessor.QUEUE_NAME) storageProcessor: Queue
  ) {
    setQueues([new BullAdapter(mailerProcessor), new BullAdapter(storageProcessor)]);
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(EntityManagerContextMiddleware, SessionCheckMiddleware).forRoutes({
      method: RequestMethod.ALL,
      path: "*"
    });

    consumer.apply(BullBoard).forRoutes({
      method: RequestMethod.ALL,
      path: "bull"
    });
  }
}
