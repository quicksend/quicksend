import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

import { BullModule } from "@nestjs/bull";

import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "nestjs-throttler";

import { BullBoard } from "@quicksend/bull-board";
import { RequestContextMiddleware } from "@quicksend/nestjs-request-context";

import { MikroOrmModuleConfig } from "../common/config/modules/mikro-orm-module.config";
import { SharedBullModuleConfig } from "../common/config/modules/shared-bull-module.config";
import { ThrottlerModuleConfig } from "../common/config/modules/throttler-module.config";

import { RequestContext } from "../common/contexts/request.context";

import { AllExceptionsFilter } from "../common/filters/all-exception.filter";
import { ThrottlerExceptionFilter } from "../common/filters/throttler-exception.filter";
import { ValidationExceptionFilter } from "../common/filters/validation-exception.filter";

import { EntityManagerContextMiddleware } from "../common/middleware/entity-manager-context.middleware";

import { ApplicationsModule } from "../applications/applications.module";
import { AuthModule } from "../auth/auth.module";
import { FilesModule } from "../files/files.module";
import { MailerModule } from "../mailer/mailer.module";
import { RepositoriesModule } from "../repositories/repositories.module";
import { SharingModule } from "../sharing/sharing.module";
import { StorageModule } from "../storage/storage.module";
import { TrashModule } from "../trash/trash.module";
import { UserModule } from "../user/user.module";

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

    EventEmitterModule.forRoot({
      verboseMemoryLeak: true
    }),

    FilesModule,

    MailerModule,

    MikroOrmModule.forRootAsync({
      useClass: MikroOrmModuleConfig
    }),

    RepositoriesModule,

    ScheduleModule.forRoot(),

    SharingModule,

    StorageModule,

    ThrottlerModule.forRootAsync({
      useClass: ThrottlerModuleConfig
    }),

    TrashModule,

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
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware(RequestContext), EntityManagerContextMiddleware)
      .forRoutes({
        method: RequestMethod.ALL,
        path: "*"
      });

    consumer.apply(BullBoard.getRouter()).forRoutes({
      method: RequestMethod.ALL,
      path: "bull"
    });
  }
}
