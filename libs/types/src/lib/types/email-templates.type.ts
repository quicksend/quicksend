export const EMAIL_TEMPLATES = [
  "email-changed",
  "email-confirmation",
  "file-invitation",
  "password-changed",
  "reset-password"
] as const;

export type EmailTemplates = typeof EMAIL_TEMPLATES;
