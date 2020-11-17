import { File } from "./file.interface";

export interface IncomingFile extends File {
  discriminator: string;
}
