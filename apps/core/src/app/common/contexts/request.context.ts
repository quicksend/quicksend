import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

import { BaseRequestContext } from "@alexy4744/nestjs-request-context";

export class RequestContext extends BaseRequestContext<RequestContext>() {
  application?: string;
  entityManager!: EntityManager<PostgreSqlDriver>;
  user?: string;
}
