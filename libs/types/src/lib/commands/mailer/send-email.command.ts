import { CommandPattern } from "../../patterns/command.pattern";

import { EmailTemplates } from "../../types/email-templates.type";

export interface SendEmailPayload {
  context: Record<string, unknown>;
  subject: string;
  template: EmailTemplates[number];
  to: string;
}

export type SendEmailPattern = CommandPattern<"mailer", "email", "send">;
