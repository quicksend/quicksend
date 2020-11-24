import { UserModel } from "@quicksend/models";

export interface GenericFileModel {
  createdAt: Date;
  deletedAt: Date;
  id: string;
  name: string;
  user: UserModel;
}
