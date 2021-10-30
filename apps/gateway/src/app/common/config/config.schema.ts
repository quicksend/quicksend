import { z } from "zod";

export const configSchema = z.object({
  http: z.object({
    domain: z.string().default("localhost:3000"),
    port: z.union([z.number(), z.string()]).default(3000)
  }),

  logs: z.object({
    directory: z.string().default("/tmp/quicksend")
  }),

  nats: z.object({
    password: z.string().optional(),
    servers: z.array(z.string()).default(["localhost:4222"]),
    username: z.string().optional()
  })
});

export type Config = z.infer<typeof configSchema>;
