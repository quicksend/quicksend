import { IncomingFile } from "./incoming-file.interface";

export interface SavedFile extends IncomingFile {
  hash: string;
  size: number;
}
