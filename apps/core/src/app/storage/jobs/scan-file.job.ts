import { FilterQuery } from "@mikro-orm/core";

import { File } from "../entities/file.entity";

export const SCAN_FILE = "SCAN_FILE";

export interface ScanFileJob {
  file: FilterQuery<File>;
}
