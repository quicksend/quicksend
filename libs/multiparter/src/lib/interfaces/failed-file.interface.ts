import { IncomingFile } from "./incoming-file.interface";

export interface FailedFile {
  error: Error;
  file: IncomingFile;
}
