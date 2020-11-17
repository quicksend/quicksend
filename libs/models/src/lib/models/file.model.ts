import { FolderModel } from "./folder.model";
import { ItemModel } from "./item.model";
import { UserModel } from "./user.model";

export interface FileModel {
  createdAt: Date;
  deletedAt: Date;
  id: string;
  item: ItemModel;
  name: string;
  parent: FolderModel;
  user: UserModel;
}
