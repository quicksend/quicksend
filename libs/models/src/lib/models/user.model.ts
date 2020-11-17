export interface UserModel {
  activated: boolean;
  admin: boolean;
  createdAt: Date;
  deletedAt: Date;
  email: string;
  id: string;
  password: string;
  username: string;
}
