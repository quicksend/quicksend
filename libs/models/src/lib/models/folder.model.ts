import { GenericFileModel } from "@quicksend/models";

export interface FolderModel extends GenericFileModel {
  children: GenericFileModel[];
  isRoot: boolean;
  parent: FolderModel;
}
