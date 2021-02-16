import { ConfigFactory, registerAs } from "@nestjs/config";

export interface SecretsConfig {
  applications: string;
  recaptcha: string;
  sessions: string;
}

export const secretsNamespace = registerAs<ConfigFactory<SecretsConfig>>(
  "secrets",
  () => ({
    applications: process.env.APPLICATIONS_SECRET!,
    recaptcha: process.env.RECAPTCHA_SECRET!,
    sessions: process.env.SESSIONS_SECRET!
  })
);
