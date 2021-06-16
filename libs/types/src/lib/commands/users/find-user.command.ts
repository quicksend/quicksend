import { User } from "../../entities/users.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface FindUserPayload {
  user: Partial<Omit<User, "password">>;
}

export type FindUserPattern = CommandPattern<"users", "user", "find">;
