import { Application } from "../../entities/applications.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface FindApplicationPayload {
  application: Partial<Application>;
}

export type FindApplicationPattern = CommandPattern<"applications", "application", "find">;
