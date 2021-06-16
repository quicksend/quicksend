import { CommandPattern } from "../../patterns/command.pattern";

export interface ConfirmUserEmailPayload {
  token: string;
}

export type ConfirmUserEmailPattern = CommandPattern<"users", "user", "confirm-email">;
