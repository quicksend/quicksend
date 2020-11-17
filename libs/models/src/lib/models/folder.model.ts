import { UserModel } from "@quicksend/models";

export interface FolderModel {
  children: FolderModel[];
  createdAt: Date;
  deletedAt: Date;
  id: string;
  isRoot: boolean;
  name: string;
  parent: FolderModel;
  user: UserModel;
}
