import { IncomingFile } from "./incoming-file.interface";

export interface FailedFile {
  error: string;
  file: IncomingFile;
}
