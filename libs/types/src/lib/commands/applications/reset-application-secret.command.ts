import { CommandPattern } from "../../patterns/command.pattern";

import { FindApplicationPayload } from "./find-application.command";

export type ResetApplicationSecretPayload = FindApplicationPayload;

export type ResetApplicationSecretPattern = CommandPattern<
  "applications",
  "application",
  "reset-secret"
>;
