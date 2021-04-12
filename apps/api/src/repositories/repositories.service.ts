import { Injectable } from "@nestjs/common";

import { EntityManager, EntityRepository, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { EntityName, GetRepository } from "@mikro-orm/core";

import { entityManagerContext } from "../common/contexts/entity-manager.context";

@Injectable()
export class RepositoriesService {
  constructor(private readonly entityManager: EntityManager<PostgreSqlDriver>) {}

  getRepository<Entity, Repository extends EntityRepository<Entity>>(
    entityName: EntityName<Entity>
  ): GetRepository<Entity, Repository> {
    const store = entityManagerContext.getStore();

    if (store) {
      return store.getRepository(entityName);
    }

    return this.entityManager.getRepository(entityName);
  }
}
