import { User } from "../../entities/users.entities";

import { EventPattern } from "../../patterns/event.pattern";

export interface PasswordResetCreatedPayload {
  token: string;
  user: User;
}

export type PasswordResetCreatedPattern = EventPattern<"users", "password-reset", "created">;
