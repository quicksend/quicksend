import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { MikroOrmModuleOptions, MikroOrmOptionsFactory } from "@mikro-orm/nestjs";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

import { RequestContext } from "../../../common/contexts/request.context";

import { Config } from "../config.interface";

@Injectable()
export class MikroOrmModuleConfig implements MikroOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<Config>) {}

  createMikroOrmOptions(): MikroOrmModuleOptions {
    const database = this.configService.get("database") as Config["database"];

    return {
      autoLoadEntities: true,
      context: (): Maybe<EntityManager<PostgreSqlDriver>> => {
        return RequestContext.getStore()?.entityManager;
      },
      dbName: database.name,
      debug: database.debug,
      driver: PostgreSqlDriver,
      host: database.hostname,
      password: database.password,
      port: database.port,
      registerRequestContext: false,
      user: database.username
    };
  }
}
