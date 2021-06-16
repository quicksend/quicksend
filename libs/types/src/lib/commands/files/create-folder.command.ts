import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface CreateFolderPayload {
  name: string;
  parent: Partial<File>;
}

export type CreateFolderPattern = CommandPattern<"files", "folder", "create">;
