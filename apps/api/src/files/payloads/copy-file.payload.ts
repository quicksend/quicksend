import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../../folders/entities/folder.entity";
import { User } from "../../user/entities/user.entity";
import { VirtualFile } from "../entities/virtual-file.entity";

export interface CopyFilePayload {
  destination: FilterQuery<Folder>;
  source: FilterQuery<VirtualFile>;
  user: User;
}
