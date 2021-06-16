import { ApplicationScopes } from "../../enums/application-scopes.enum";

import { CommandPattern } from "../../patterns/command.pattern";

export interface CreateApplicationPayload {
  name: string;
  owner: string;
  scopes: ApplicationScopes[];
}

export type CreateApplicationPattern = CommandPattern<"applications", "application", "create">;
