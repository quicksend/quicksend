import { Application } from "../../entities/applications.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface DeleteApplicationPayload {
  application: Partial<Application>;
}

export type DeleteApplicationPattern = CommandPattern<"applications", "application", "delete">;
