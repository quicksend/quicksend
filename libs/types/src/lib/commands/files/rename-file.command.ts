import { CommandPattern } from "../../patterns/command.pattern";

import { FindFilePayload } from "./find-file.command";

export interface RenameFilePayload extends FindFilePayload {
  newName: string;
}

export type RenameFilePattern = CommandPattern<"files", "file", "rename">;
