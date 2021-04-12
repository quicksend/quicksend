import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../../folders/entities/folder.entity";
import { VirtualFile } from "../entities/virtual-file.entity";

export interface MoveFilePayload {
  destination: FilterQuery<Folder>;
  source: FilterQuery<VirtualFile>;
}
