import { EventPattern } from "../../patterns/event.pattern";

import { User } from "../../entities/users.entities";

export interface UserDeletedPayload {
  user: User;
}

export type UserDeletedPattern = EventPattern<"users", "user", "deleted">;
