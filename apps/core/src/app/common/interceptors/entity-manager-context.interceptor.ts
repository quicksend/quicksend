import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import { Observable } from "rxjs";

import { RequestContext } from "../contexts/request.context";

@Injectable()
export class EntityManagerContextInterceptor implements NestInterceptor {
  constructor(private readonly orm: MikroORM<PostgreSqlDriver>) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const context = RequestContext.getStore();

    if (!context) {
      throw new Error(
        `Cannot set entity manager of request context because the store is ${context}`
      );
    }

    context.entityManager = this.orm.em.fork(true, true);

    return next.handle();
  }
}
