import { CommandPattern } from "../../patterns/command.pattern";

export interface ResetUserPasswordPayload {
  newPassword: string;
  token: string;
}

export type ResetUserPasswordPattern = CommandPattern<"users", "user", "reset-password">;
