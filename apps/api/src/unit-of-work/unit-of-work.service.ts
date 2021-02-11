/**
 * https://aaronboman.com/programming/2020/05/15/per-request-database-transactions-with-nestjs-and-typeorm/
 *
 * If withTransaction is called, it will retrieve the repository from the manager handling the transaction
 * Else, it will fall back to TypeOrm's default global functions
 *
 * Any injectable that uses this service will lose the capability of using NestJS lifecycle events
 * because UnitOfWorkService is request scoped
 */

import { Injectable, Scope } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";

import {
  Connection,
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
  TreeRepository,
  getCustomRepository,
  getRepository,
  getTreeRepository
} from "typeorm";

import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

@Injectable({ scope: Scope.REQUEST })
export class UnitOfWorkService {
  private transactionManager: EntityManager | null = null;

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  getCustomRepository<CustomRepository extends Repository<any>>(
    target: ObjectType<CustomRepository>
  ): CustomRepository {
    if (this.transactionManager) {
      return this.transactionManager.getCustomRepository(target);
    }

    return getCustomRepository(target);
  }

  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity>
  ): Repository<Entity> {
    if (this.transactionManager) {
      return this.transactionManager.getRepository(target);
    }

    return getRepository(target);
  }

  getTreeRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity>
  ): TreeRepository<Entity> {
    if (this.transactionManager) {
      return this.transactionManager.getTreeRepository(target);
    }

    return getTreeRepository(target);
  }

  async withTransaction<T>(
    work: () => T,
    isolationLevel?: IsolationLevel
  ): Promise<T> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    this.transactionManager = queryRunner.manager;

    try {
      const result = await work();

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();

      this.transactionManager = null;
    }
  }
}
