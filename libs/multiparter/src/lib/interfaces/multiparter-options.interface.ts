import { IncomingFile } from "./incoming-file.interface";
import { StorageEngine } from "./storage-engine.interface";

export interface MultiparterOptions {
  busboy: busboy.BusboyConfig;

  engine: StorageEngine;

  field: string;

  filter?: (file: IncomingFile) => Promise<boolean>;
}
