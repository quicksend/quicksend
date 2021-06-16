import { CommandPattern } from "../../patterns/command.pattern";

export interface CreateUserPayload {
  email: string;
  password: string;
  username: string;
}

export type CreateUserPattern = CommandPattern<"users", "user", "create">;
