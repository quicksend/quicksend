export interface UserModel {
  activated: boolean;
  admin: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  email: string;
  id: string;
  password: string;
  username: string;
}
