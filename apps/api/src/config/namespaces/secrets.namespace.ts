import { ConfigFactory, registerAs } from "@nestjs/config";

export interface SecretsConfig {
  recaptcha: string;
  sessions: string;
}

export const secretsNamespace = registerAs<ConfigFactory<SecretsConfig>>(
  "secrets",
  () => ({
    recaptcha: process.env.RECAPTCHA_SECRET!,
    sessions: process.env.SESSIONS_SECRET!
  })
);
