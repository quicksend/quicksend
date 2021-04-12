import { PhysicalFile } from "../entities/physical-file.entity";

export interface CreatePhysicalFileResult {
  isNew: boolean;
  physicalFile: PhysicalFile;
}
