import { CommandPattern } from "../../patterns/command.pattern";

export interface ChangeUserPasswordPayload {
  newPassword: string;
  user: string;
}

export type ChangeUserPasswordPattern = CommandPattern<"users", "user", "change-password">;
