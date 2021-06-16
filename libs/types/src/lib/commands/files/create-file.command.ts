import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface CreateFilePayload {
  hash: string;
  name: string;
  owner: string;
  parent: Partial<File>;
  size: number;
}

export type CreateFilePattern = CommandPattern<"files", "file", "create">;
