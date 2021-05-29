import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

import { RequestContext as BaseRequestContext } from "@quicksend/nestjs-request-context";

import { User } from "../../user/entities/user.entity";

export class RequestContext extends BaseRequestContext<RequestContext>() {
  entityManager?: EntityManager<PostgreSqlDriver>;
  user?: User;
}
