import { ApplicationScopes } from "../../enums/application-scopes.enum";

import { BaseEntity } from "../base.entity";

export interface Application extends BaseEntity {
  name: string;
  owner: string;
  scopes: ApplicationScopes[];
  secret: string;
}
