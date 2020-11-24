import { FolderModel, ItemModel, UserModel } from "@quicksend/models";

export interface FileModel {
  createdAt: Date;
  deletedAt: Date;
  id: string;
  item: ItemModel | null;
  name: string;
  parent: FolderModel;
  user: UserModel;
}
