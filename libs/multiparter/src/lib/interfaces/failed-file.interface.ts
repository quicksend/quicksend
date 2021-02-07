import { IncomingFile } from "./incoming-file.interface";

export interface FailedFile {
  file: IncomingFile;
  reason: Error;
}
