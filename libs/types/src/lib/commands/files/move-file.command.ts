import { File } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface MoveFilePayload {
  from: Partial<File>;
  to: Partial<File>;
}

export type MoveFilePattern = CommandPattern<"files", "file", "move">;
