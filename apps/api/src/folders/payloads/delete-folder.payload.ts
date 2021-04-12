import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../entities/folder.entity";

export interface DeleteFolderPayload {
  deleteRoot?: boolean;
  folder: FilterQuery<Folder>;
}
