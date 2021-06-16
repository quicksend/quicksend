import { Trash } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface FindTrashPayload {
  trash: Omit<Partial<Trash>, "file" | "originalParent"> & {
    file?: string;
    originalParent?: string;
  };
}

export type FindTrashPattern = CommandPattern<"files", "trash", "find">;
