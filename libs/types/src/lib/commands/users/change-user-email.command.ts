import { CommandPattern } from "../../patterns/command.pattern";

export interface ChangeUserEmailPayload {
  newEmail: string;
  user: string;
}

export type ChangeUserEmailPattern = CommandPattern<"users", "user", "change-email">;
