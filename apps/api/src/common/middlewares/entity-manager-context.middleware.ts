import { Injectable, NestMiddleware } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";
import { NextFunction, Request, Response } from "express";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { entityManagerContext } from "../contexts/entity-manager.context";

@Injectable()
export class EntityManagerContextMiddleware implements NestMiddleware {
  constructor(private readonly orm: MikroORM<PostgreSqlDriver>) {}

  use(_req: Request, _res: Response, next: NextFunction): void {
    entityManagerContext.run(this.orm.em.fork(true, true), next);
  }
}
