import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

import { config } from "@quicksend/config";

import { RedisConfig } from "./redis.config";

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      database: config.get("database").name,
      host: config.get("database").hostname,
      port: config.get("database").port,
      username: config.get("database").username,
      password: config.get("database").password,
      autoLoadEntities: true,
      cache: {
        duration: 1000,
        options: new RedisConfig(),
        type: "ioredis"
      },
      synchronize: true,
      type: "postgres"
    };
  }
}
