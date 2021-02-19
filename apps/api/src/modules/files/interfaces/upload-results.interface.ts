import { FailedFile } from "@quicksend/multiparter";

import { FileEntity } from "../file.entity";

export interface UploadResults {
  failed: FailedFile[];
  succeeded: FileEntity[];
}
