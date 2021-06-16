import { BaseEntity } from "../base.entity";

export interface User extends BaseEntity {
  deletedAt?: number;
  email: string;
  password: string;
  username: string;
}
