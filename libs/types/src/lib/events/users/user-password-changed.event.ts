import { EventPattern } from "../../patterns/event.pattern";

import { User } from "../../entities/users.entities";

export interface UserPasswordChangedPayload {
  newPassword: string;
  user: User;
}

export type UserPasswordChangedPattern = EventPattern<"users", "user", "password-changed">;
