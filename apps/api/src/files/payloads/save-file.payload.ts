import { File } from "@quicksend/transmit";
import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../../folders/entities/folder.entity";

import { ShareFilePayload } from "./share-file.payload";

export interface SaveFilePayload {
  folder: FilterQuery<Folder>;
  metadata: File;
  sharing?: Omit<ShareFilePayload, "file" | "inviter">;
}
