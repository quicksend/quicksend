import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { Observable, lastValueFrom, of } from "rxjs";

import { RequestContext } from "../contexts/request.context";

export class TransactionalInterceptor implements NestInterceptor {
  async intercept(_ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const entityManager = RequestContext.getItem("entityManager");
    console.log(RequestContext.getStore());
    const result = await this.withTransaction(entityManager, () => next.handle());

    return of(result);
  }

  private async withTransaction<T>(
    entityManager: EntityManager,
    work: () => Observable<T>
  ): Promise<T> {
    await entityManager.begin();

    try {
      const result = await lastValueFrom(work());

      await entityManager.commit();

      return result;
    } catch (error) {
      await entityManager.rollback();

      throw error;
    }
  }
}
