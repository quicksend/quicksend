import { EventPattern } from "../../patterns/event.pattern";

import { User } from "../../entities/users.entities";

export interface UserEmailChangedPayload {
  newEmail: string;
  oldEmail: string;
  user: User;
}

export type UserEmailChangedPattern = EventPattern<"users", "user", "email-changed">;
