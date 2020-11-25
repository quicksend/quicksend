// https://aaronboman.com/programming/2020/05/15/per-request-database-transactions-with-nestjs-and-typeorm/

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";

import {
  Connection,
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
  getRepository
} from "typeorm";

import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { RepositoryFactory } from "typeorm/repository/RepositoryFactory";

@Injectable()
export class UnitOfWorkService {
  private _manager: EntityManager | null = null;

  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  get manager(): EntityManager | null {
    return this._manager;
  }

  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    if (this.manager) {
      return new RepositoryFactory().create(
        this.manager,
        this.connection.getMetadata(target)
      );
    }

    return getRepository(target);
  }

  async withTransaction<T>(
    work: () => T,
    isolationLevel?: IsolationLevel
  ): Promise<T> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    this._manager = queryRunner.manager;

    try {
      const result = await work();

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();

      this._manager = null;
    }
  }
}
