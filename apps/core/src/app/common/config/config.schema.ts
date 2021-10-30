import { z } from "zod";

export const configSchema = z.object({
  database: z.object({
    debug: z.boolean().default(false),
    hostname: z.string().default("localhost"),
    name: z.string().default("quicksend"),
    password: z.string(),
    port: z.union([z.number(), z.string()]).default(5432),
    username: z.string().default("quicksend")
  }),

  http: z.object({
    domain: z.string().default("localhost:3001"),
    port: z.union([z.number(), z.string()]).default(3001)
  }),

  jwt: z.object({
    access_token_secret: z.string(),
    refresh_token_secret: z.string()
  }),

  logs: z.object({
    directory: z.string().default("/tmp/quicksend")
  }),

  nats: z.object({
    password: z.string().optional(),
    servers: z.array(z.string()).default(["localhost:4222"]),
    username: z.string().optional()
  }),

  redis: z.object({
    hostname: z.string().default("localhost"),
    password: z.string().optional(),
    port: z.union([z.number(), z.string()]).default(6379)
  }),

  smtp: z.object({
    from: z.string(),
    hostname: z.string(),
    password: z.string(),
    port: z.union([z.number(), z.string()]).default(465),
    username: z.string()
  }),

  storage: z.object({
    limits: z.object({
      max_file_size: z.number().positive()
    }),

    manager: z.object({
      options: z.record(z.any()),
      type: z.string()
    })
  })
});

export type Config = z.infer<typeof configSchema>;
