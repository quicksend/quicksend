import { ApplicationScopes } from "../../enums/application-scopes.enum";

import { CommandPattern } from "../../patterns/command.pattern";

import { FindApplicationPayload } from "./find-application.command";

export interface UpdateApplicationPayload extends FindApplicationPayload {
  data: {
    name: string;
    scopes: ApplicationScopes[];
  };
}

export type UpdateApplicationPattern = CommandPattern<"applications", "application", "update">;
