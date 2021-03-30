import { Injectable } from "@nestjs/common";

import {
  EntitySchema,
  ObjectType,
  Repository,
  TreeRepository,
  getCustomRepository,
  getRepository,
  getTreeRepository
} from "typeorm";

import { RequestContext } from "../common/contexts/request.context";

@Injectable()
export class TransactionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCustomRepository<CustomRepository extends Repository<any>>(
    target: ObjectType<CustomRepository>
  ): CustomRepository {
    const store = RequestContext.get<RequestContext>();

    if (store && store.transactionManager) {
      return store.transactionManager.getCustomRepository(target);
    }

    return getCustomRepository(target);
  }

  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity>
  ): Repository<Entity> {
    const store = RequestContext.get<RequestContext>();

    if (store && store.transactionManager) {
      return store.transactionManager.getRepository(target);
    }

    return getRepository(target);
  }

  getTreeRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity>
  ): TreeRepository<Entity> {
    const store = RequestContext.get<RequestContext>();

    if (store && store.transactionManager) {
      return store.transactionManager.getTreeRepository(target);
    }

    return getTreeRepository(target);
  }
}
