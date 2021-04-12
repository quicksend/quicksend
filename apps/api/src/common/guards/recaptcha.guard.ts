import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpService,
  Injectable,
  Type,
  mixin
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { Request } from "express";
import { URL, URLSearchParams } from "url";

import { getClientIp } from "request-ip";

import { Config } from "../../common/config/config.interface";

interface RecaptchaVerificationResult {
  action?: string; // only defined if it is recaptcha v3
  // eslint-disable-next-line camelcase
  challenge_ts: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  "error-codes"?: RecaptchaErrorCode[];
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  score?: number; // only defined if it is recaptcha v3
  success: boolean;
}

type RecaptchaErrorCode =
  | "bad-request"
  | "invalid-input-response"
  | "invalid-input-secret"
  | "missing-input-response"
  | "missing-input-secret"
  | "timeout-or-duplicate";

export interface RecaptchaGuardOptions {
  action: string;
  score: number;
}

export const RecaptchaGuard = (options?: RecaptchaGuardOptions): Type<CanActivate> => {
  @Injectable()
  class RecaptchaMixinGuard implements CanActivate {
    constructor(
      private readonly configService: ConfigService<Config>,
      private readonly httpService: HttpService
    ) {}

    private get secret(): string {
      const recaptcha = this.configService.get("recaptcha") as Config["recaptcha"];

      return recaptcha.secret;
    }

    private get url(): string {
      const recaptcha = this.configService.get("recaptcha") as Config["recaptcha"];
      const url = new URL("/recaptcha/api/siteverify", recaptcha.url);

      return url.toString();
    }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest<Request>();

      if (!req.body.recaptcha) {
        throw new BadRequestException("Please complete the reCAPTCHA!");
      }

      const ip = getClientIp(req) || undefined;

      const verification = await this.verifyRecaptchaResponse(req.body.recaptcha, ip);

      if (verification["error-codes"] && verification["error-codes"].length) {
        throw this.createExceptionFromErrorCode(verification["error-codes"][0]);
      }

      if (!verification.success) {
        throw this.createExceptionFromErrorCode("invalid-input-response");
      }

      // For reCAPTCHA v3 only
      if (verification.action && verification.score) {
        if (!options) {
          throw new Error("Action or score not provided for reCAPTCHA v3!");
        }

        if (verification.action !== options.action || verification.score < options.score) {
          throw this.createExceptionFromErrorCode("invalid-input-response");
        }
      }

      return true;
    }

    private createExceptionFromErrorCode(code: RecaptchaErrorCode): Error {
      switch (code) {
        case "bad-request":
        case "invalid-input-response":
        case "timeout-or-duplicate":
          return new BadRequestException("reCAPTCHA failed, please try again.");

        case "invalid-input-secret":
          return new Error("Invalid reCAPTCHA secret.");

        case "missing-input-response":
          return new Error("Missing reCAPTCHA response from user.");

        case "missing-input-secret":
          return new Error("Missing reCAPTCHA secret.");
      }
    }

    private verifyRecaptchaResponse(
      response: string,
      ip?: string
    ): Promise<RecaptchaVerificationResult> {
      const params = new URLSearchParams({
        remoteip: ip,
        response,
        secret: this.secret
      });

      return this.httpService
        .post<RecaptchaVerificationResult>(this.url, params.toString())
        .toPromise()
        .then((res) => res.data);
    }
  }

  return mixin(RecaptchaMixinGuard);
};
