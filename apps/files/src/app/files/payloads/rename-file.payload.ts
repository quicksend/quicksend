import { RenameFilePayload as IRenameFilePayload } from "@quicksend/types";

import { IsNotEmpty, IsString, MaxLength } from "class-validator";

import { FindFilePayload } from "./find-file.payload";

export class RenameFilePayload extends FindFilePayload implements IRenameFilePayload {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  newName!: string;
}
