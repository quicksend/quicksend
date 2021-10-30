import { z } from "zod";

export const s3ManagerOptionsSchema = z.object({
  // TODO
});

export type S3ManagerOptions = z.infer<typeof s3ManagerOptionsSchema>;
