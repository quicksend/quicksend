import { FailedFile } from "@quicksend/multiparter";
import { FileEntity } from "../entities/file.entity";

export class UploadResultsDto {
  failed!: FailedFile[];

  succeeded!: FileEntity[];
}
