import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import {
  EmailConfirmationCreatedPattern,
  EmailConfirmationCreatedPayload,
  PasswordResetCreatedPattern,
  PasswordResetCreatedPayload,
  SendEmailPattern,
  UserEmailChangedPattern,
  UserEmailChangedPayload,
  UserPasswordChangedPattern,
  UserPasswordChangedPayload
} from "@quicksend/types";

import { MailerService } from "./mailer.service";

import { SendEmailPayload } from "./payloads/send-email.payload";

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern<SendEmailPattern>("mailer.email.send")
  send(@Payload() payload: SendEmailPayload): Promise<void> {
    return this.mailerService.renderAndSend(payload.template, payload.context, {
      subject: payload.subject,
      to: payload.to
    });
  }

  @EventPattern<EmailConfirmationCreatedPattern>("users.email-confirmation.created")
  handleUserEmailConfirmationCreated(payload: EmailConfirmationCreatedPayload): Promise<void> {
    return this.mailerService.renderAndSend(
      "email-confirmation",
      {
        url: `/confirm-email/${payload.token}`,
        username: payload.user.username
      },
      {
        subject: "Please confirm your email address.",
        to: payload.user.email
      }
    );
  }

  @EventPattern<PasswordResetCreatedPattern>("users.password-reset.created")
  handleUserPasswordResetCreated(payload: PasswordResetCreatedPayload): Promise<void> {
    return this.mailerService.renderAndSend(
      "reset-password",
      {
        url: `/reset-password/${payload.token}`,
        username: payload.user.username
      },
      {
        subject: "Password reset requested.",
        to: payload.user.email
      }
    );
  }

  @EventPattern<UserEmailChangedPattern>("users.user.email-changed")
  handleUserPostEmailChange(payload: UserEmailChangedPayload): Promise<void> {
    return this.mailerService.renderAndSend(
      "email-changed",
      {
        date: new Date().toUTCString(),
        newEmail: payload.newEmail,
        url: "/forgot-password",
        username: payload.user.username
      },
      {
        subject: "Your email has been changed.",
        to: payload.oldEmail
      }
    );
  }

  @EventPattern<UserPasswordChangedPattern>("users.user.password-changed")
  handleUserPostPasswordChange(payload: UserPasswordChangedPayload): Promise<void> {
    return this.mailerService.renderAndSend(
      "password-changed",
      {
        date: new Date().toUTCString(),
        url: "/forgot-password",
        username: payload.user.username
      },
      {
        subject: "Your password has been changed.",
        to: payload.user.email
      }
    );
  }
}
