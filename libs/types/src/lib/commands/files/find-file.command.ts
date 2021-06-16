import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface FindFilePayload {
  file: Partial<File>;
}

export type FindFilePattern = CommandPattern<"files", "file", "find">;
