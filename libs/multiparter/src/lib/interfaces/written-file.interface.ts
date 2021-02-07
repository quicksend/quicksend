import { IncomingFile } from "./incoming-file.interface";

export interface WrittenFile extends IncomingFile {
  hash: string;
  size: number;
}
