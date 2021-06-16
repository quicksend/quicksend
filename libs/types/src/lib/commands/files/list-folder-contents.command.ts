import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface ListFolderContentsPayload {
  after?: string;
  folder: Partial<File>;
  limit: number;
}

export type ListFolderContentsPattern = CommandPattern<"files", "folder", "list-contents">;
