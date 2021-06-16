import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface CopyFilePayload {
  from: Partial<File>;
  to: Partial<File>;
}

export type CopyFilePattern = CommandPattern<"files", "file", "copy">;
