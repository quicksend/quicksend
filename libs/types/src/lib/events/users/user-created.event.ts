import { EventPattern } from "../../patterns/event.pattern";

import { User } from "../../entities/users.entities";

export interface UserCreatedPayload {
  user: User;
}

export type UserCreatedPattern = EventPattern<"users", "user", "created">;
