import { ConfigFactory, registerAs } from "@nestjs/config";

import { URL } from "url";

export interface HttpConfig {
  backendUrl: URL;
  frontendUrl: URL;
  port: number;
}

export const httpNamespace = registerAs<ConfigFactory<HttpConfig>>(
  "http",
  () => ({
    backendUrl: new URL(process.env.BACKEND_URL!),
    frontendUrl: new URL(process.env.FRONTEND_URL!),
    port: +Number(process.env.PORT) || 3000
  })
);
