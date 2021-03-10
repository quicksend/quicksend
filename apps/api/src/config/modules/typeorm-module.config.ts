import { Inject, Injectable } from "@nestjs/common";

import { ConfigType } from "@nestjs/config";

import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

import { postgresNamespace } from "../config.namespaces";

@Injectable()
export class TypeOrmModuleConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(postgresNamespace.KEY)
    private readonly postgresConfig: ConfigType<typeof postgresNamespace>
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      autoLoadEntities: true,
      database: this.postgresConfig.name,
      host: this.postgresConfig.hostname,
      password: this.postgresConfig.password,
      port: this.postgresConfig.port,
      synchronize: true,
      type: "postgres",
      username: this.postgresConfig.username
    };
  }
}
