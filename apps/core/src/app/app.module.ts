import * as rfs from "rotating-file-stream";

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";

import { BullModule } from "@nestjs/bull";
import { ClassSerializerInterceptor, Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { ExpressParser } from "@ogma/platform-express";
import { NatsParser } from "@ogma/platform-nats";
import { OgmaInterceptor, OgmaModule } from "@ogma/nestjs-module";

import {
  Maybe,
  RpcExceptionFilter,
  ValidationExceptionFilter,
  ValidationPipe
} from "@quicksend/common";

import { RequestContextGuard } from "@alexy4744/nestjs-request-context";

import { Config } from "./common/config/config.schema";
import { loadTomlConfig } from "./common/config/config.loader";

import { RequestContext } from "./common/contexts/request.context";

import { EntityManagerContextInterceptor } from "./common/interceptors/entity-manager-context.interceptor";

import { generateLogFilename } from "./common/utils/generate-log-filename.util";

import { ApplicationsModule } from "./applications/applications.module";
import { AuthModule } from "./auth/auth.module";
import { BrokerModule } from "./broker/broker.module";
import { BullBoardModule } from "./bull-board/bull-board.module";
import { ItemsModule } from "./items/items.module";
import { MailerModule } from "./mailer/mailer.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";

import { Capabilities } from "./items/embeddables/capabilities.embeddable";
import { Folder } from "./items/embeddables/folder.embeddable";
import { Infection } from "./storage/embeddables/infection.embeddable";
import { Lock } from "./items/embeddables/lock.embeddable";
import { Snapshot } from "./items/embeddables/snapshot.embeddable";
import { Trash } from "./items/embeddables/trash.embeddable";

@Global()
@Module({
  imports: [
    ApplicationsModule,

    AuthModule,

    BrokerModule,

    BullBoardModule,

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        redis: {
          host: configService.get("redis").hostname,
          password: configService.get("redis").password,
          port: configService.get("redis").port
        }
      })
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadTomlConfig]
    }),

    ItemsModule,

    MailerModule,

    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        autoLoadEntities: true,
        context: (): Maybe<EntityManager<PostgreSqlDriver>> => {
          return RequestContext.getStore()?.entityManager;
        },
        dbName: configService.get("database").name,
        debug: configService.get("database").debug,
        driver: PostgreSqlDriver,
        entities: [Capabilities, Folder, Infection, Lock, Snapshot, Trash], // TODO: Embeddables will be autoloaded in MikroORM v5
        host: configService.get("database").hostname,
        password: configService.get("database").password,
        port: configService.get("database").port,
        registerRequestContext: false,
        user: configService.get("database").username
      })
    }),

    OgmaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        service: {
          color: true,
          context: "Quicksend",
          stream: rfs.createStream(generateLogFilename, {
            interval: "1d",
            path: configService.get("logs").directory,
            teeToStdout: true
          })
        },
        interceptor: {
          http: ExpressParser,
          rpc: NatsParser
        }
      })
    }),

    ProfilesModule,

    RepositoriesModule,

    StorageModule,

    UsersModule
  ],
  exports: [BrokerModule, BullBoardModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: RequestContextGuard(RequestContext)
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EntityManagerContextInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor
    },
    {
      provide: APP_PIPE,
      useFactory: ValidationPipe
    }
  ]
})
export class AppModule {}
