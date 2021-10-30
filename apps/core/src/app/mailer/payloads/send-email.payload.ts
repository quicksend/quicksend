import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";

import { EmailTemplates } from "../enums/email-templates.enum";

export class SendEmailPayload {
  @IsObject()
  context!: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  subject!: string;

  @IsEnum(EmailTemplates)
  @IsNotEmpty()
  @IsString()
  template!: EmailTemplates;

  @IsEmail()
  to!: string;
}
