import { Readable } from "stream";

import { File } from "./file.interface";
import { StorageEngine } from "./storage-engine.interface";

export interface MultiparterOptions {
  busboy: busboy.BusboyConfig;

  engine: StorageEngine;

  field: string;

  filter?: (file: File) => Promise<boolean>;

  transformers?: ((file: File) => Readable)[];
}
