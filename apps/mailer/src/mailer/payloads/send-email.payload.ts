import {
  EmailTemplates,
  EMAIL_TEMPLATES,
  SendEmailPayload as ISendEmailPayload
} from "@quicksend/types";

import { IsEmail, IsIn, IsNotEmpty, IsObject, IsString } from "class-validator";

export class SendEmailPayload implements ISendEmailPayload {
  @IsObject()
  context!: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  subject!: string;

  @IsIn(EMAIL_TEMPLATES)
  @IsNotEmpty()
  @IsString()
  template!: EmailTemplates[number];

  @IsEmail()
  to!: string;
}
