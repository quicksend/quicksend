import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { Observable, of } from "rxjs";

import { RequestContext } from "../contexts/request.context";

@Injectable()
export class TransactionalInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entityManager = RequestContext.getItem("entityManager");

    if (!entityManager) {
      throw new Error(`Entity manager is ${entityManager}, make sure it is set via a middleware`);
    }

    return of(this.withTransaction(() => next.handle(), entityManager));
  }

  private async withTransaction<T>(
    work: () => Observable<T>,
    entityManager: EntityManager
  ): Promise<T> {
    await entityManager.begin();

    try {
      const result = await work().toPromise();

      await entityManager.commit();

      return result;
    } catch (error) {
      await entityManager.rollback();

      throw error;
    }
  }
}
