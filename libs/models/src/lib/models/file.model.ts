import { FolderModel, GenericFileModel, ItemModel } from "@quicksend/models";

export interface FileModel extends GenericFileModel {
  item: ItemModel;
  parent: FolderModel;
}
