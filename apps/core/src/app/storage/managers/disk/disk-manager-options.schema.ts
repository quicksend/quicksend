import fs from "fs";
import path from "path";

import { z } from "zod";

const isAbsolute = (value: string): boolean => path.isAbsolute(value);

const isDirectory = (value: string): Promise<boolean> => {
  return fs.promises.stat(value).then((stats) => stats.isDirectory());
};

export const diskManagerOptionsSchema = z.object({
  directory: z
    .string()
    .refine(isAbsolute, {
      message: "Disk manager directory path must be absolute"
    })
    .refine(isDirectory, {
      message: "Disk manager directory path must be a directory"
    })
});

export type DiskManagerOptions = z.infer<typeof diskManagerOptionsSchema>;
