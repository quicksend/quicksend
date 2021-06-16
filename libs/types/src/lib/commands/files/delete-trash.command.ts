import { CommandPattern } from "../../patterns/command.pattern";

import { FindTrashPayload } from "./find-trash.command";

export type DeleteTrashPayload = FindTrashPayload;

export type DeleteTrashPattern = CommandPattern<"files", "trash", "delete">;
