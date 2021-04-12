import { AsyncLocalStorage } from "async_hooks";

import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

export const entityManagerContext = new AsyncLocalStorage<EntityManager<PostgreSqlDriver>>();
