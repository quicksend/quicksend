import { User } from "../entities/user.entity";

export interface CreateEmailConfirmationPayload {
  newEmail: string;
  password: string;
  user: User;
}
