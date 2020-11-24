import { IncomingFile } from "@quicksend/multiparter";

import { FileEntity } from "../file.entity";

export class UploadResultsDto {
  failed!: Array<{
    error: string;
    file: IncomingFile;
  }>;

  succeeded!: FileEntity[];
}
