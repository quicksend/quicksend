import { ConfigFactory, registerAs } from "@nestjs/config";

export interface SMTPConfig {
  from: string;
  hostname: string;
  password: string;
  port: number;
  secure: boolean;
  username: string;
}

export const smtpNamespace = registerAs<ConfigFactory<SMTPConfig>>(
  "smtp",
  () => ({
    from: process.env.SMTP_FROM!,
    hostname: process.env.SMTP_HOSTNAME!,
    password: process.env.SMTP_PASSWORD!,
    port: +Number(process.env.SMTP_PORT) || 465,
    secure: Boolean(process.env.SMTP_SSL) || true,
    username: process.env.SMTP_USERNAME!
  })
);
