import { User } from "../entities/user.entity";

export interface ChangeUserPasswordPayload {
  newPassword: string;
  oldPassword: string;
  user: User;
}
