import { User } from "../../entities/users.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface DeleteUserPayload {
  user: Partial<Omit<User, "password">>;
}

export type DeleteUserPattern = CommandPattern<"users", "user", "delete">;
