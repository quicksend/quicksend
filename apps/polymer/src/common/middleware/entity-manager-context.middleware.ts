import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { RequestContext } from "../contexts/request.context";

@Injectable()
export class EntityManagerContextMiddleware implements NestMiddleware {
  constructor(private readonly orm: MikroORM<PostgreSqlDriver>) {}

  use(_req: Request, _res: Response, next: NextFunction): void {
    const context = RequestContext.getStore();

    if (!context) {
      throw new Error(
        `Cannot set entity manager of request context because the store is ${context}`
      );
    }

    context.entityManager = this.orm.em.fork(true, true);

    next();
  }
}
