import { UserEntity } from "../../user/user.entity";

export interface CreateFolder {
  name: string;
  parent?: string;
  user: UserEntity;
}
