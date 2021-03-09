import { ConfigFactory, registerAs } from "@nestjs/config";

export interface DomainsConfig {
  backend: string;
  frontend: string;
}

export const domainsNamespace = registerAs<ConfigFactory<DomainsConfig>>(
  "domains",
  () => ({
    backend: process.env.BACKEND_DOMAIN!,
    frontend: process.env.FRONTEND_DOMAIN!
  })
);
