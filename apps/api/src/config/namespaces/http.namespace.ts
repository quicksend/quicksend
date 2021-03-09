import { ConfigFactory, registerAs } from "@nestjs/config";

export interface HttpConfig {
  port: number;
}

export const httpNamespace = registerAs<ConfigFactory<HttpConfig>>(
  "http",
  () => ({
    port: +Number(process.env.PORT) || 3000
  })
);
