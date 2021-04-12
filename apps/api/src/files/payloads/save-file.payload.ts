import { File } from "@quicksend/transmit";
import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../../folders/entities/folder.entity";

export interface SaveFilePayload {
  folder: FilterQuery<Folder>;
  isPublic?: boolean;
  metadata: File;
}
