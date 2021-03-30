import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
  mixin
} from "@nestjs/common";

import { InjectConnection } from "@nestjs/typeorm";

import { Connection } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

import { Observable, of } from "rxjs";

import { RequestContext } from "../common/contexts/request.context";

export const TransactionInterceptor = (
  isolationLevel?: IsolationLevel
): Type<NestInterceptor> => {
  class MixinInterceptor implements NestInterceptor {
    constructor(
      @InjectConnection()
      private readonly connection: Connection
    ) {}

    intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
      const store = RequestContext.get<RequestContext>();

      // Relies on request context to propagate transaction in nested services
      if (!store) {
        throw new Error(
          `Request context is ${store} when trying to use transactions!`
        );
      }

      return of(this.withTransaction(() => next.handle(), store));
    }

    /**
     * Wrap all database actions into one transaction
     */
    async withTransaction<T>(
      work: () => Observable<T>,
      store: RequestContext
    ): Promise<T> {
      const queryRunner = this.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction(isolationLevel);

      // Set the entity manager that will be used for the entirety of this request,
      // so that transaction service can use this entity manager for nested transactions
      store.transactionManager = queryRunner.manager;

      try {
        const result = await work().toPromise();

        await queryRunner.commitTransaction();

        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw error;
      } finally {
        await queryRunner.release();

        store.transactionManager = null;
      }
    }
  }

  return mixin(MixinInterceptor);
};
