import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { MikroOrmModuleOptions, MikroOrmOptionsFactory } from "@mikro-orm/nestjs";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

import { Config } from "../config.interface";

import { Maybe } from "../../types/maybe.type";

import { entityManagerContext } from "../../../common/contexts/entity-manager.context";

@Injectable()
export class MikroOrmModuleConfig implements MikroOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<Config>) {}

  createMikroOrmOptions(): MikroOrmModuleOptions {
    const db = this.configService.get("database") as Config["database"];

    return {
      autoLoadEntities: true,
      context: (): Maybe<EntityManager<PostgreSqlDriver>> => entityManagerContext.getStore(),
      dbName: db.name,
      debug: db.debug,
      discovery: {
        warnWhenNoEntities: true
      },
      driver: PostgreSqlDriver,
      host: db.hostname,
      password: db.password,
      port: db.port,
      registerRequestContext: false,
      user: db.username
    };
  }
}
