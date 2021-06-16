import { User } from "../../entities/users.entities";

import { EventPattern } from "../../patterns/event.pattern";

export interface EmailConfirmationCreatedPayload {
  token: string;
  user: User;
}

export type EmailConfirmationCreatedPattern = EventPattern<
  "users",
  "email-confirmation",
  "created"
>;
