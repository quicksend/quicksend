import { Injectable } from "@nestjs/common";

import { EntityManager, EntityRepository, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { EntityName, GetRepository } from "@mikro-orm/core";

import { RequestContext } from "../common/contexts/request.context";

@Injectable()
export class RepositoriesService {
  constructor(private readonly entityManager: EntityManager<PostgreSqlDriver>) {}

  getEntityManager(): EntityManager<PostgreSqlDriver> {
    const context = RequestContext.getStore();

    return context?.entityManager || this.entityManager;
  }

  getRepository<Entity, Repository extends EntityRepository<Entity>>(
    entityName: EntityName<Entity>
  ): GetRepository<Entity, Repository> {
    return this.getEntityManager().getRepository(entityName);
  }
}
