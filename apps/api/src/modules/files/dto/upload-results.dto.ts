import { Transform, Type } from "class-transformer";

import { FailedFile } from "@quicksend/multiparter";

import { FileEntity } from "../file.entity";

export class UploadResultsDto {
  failed!: FailedFile[];

  @Type(() => FileEntity)
  succeeded!: FileEntity[];
}
