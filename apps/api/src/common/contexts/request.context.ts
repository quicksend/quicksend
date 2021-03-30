import { EntityManager } from "typeorm";

import { RequestContext as BaseRequestContext } from "@quicksend/nestjs-request-context";

export class RequestContext extends BaseRequestContext {
  transactionManager: EntityManager | null = null;
}
