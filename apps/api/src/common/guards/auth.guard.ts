import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  UnauthorizedException,
  mixin
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { Request } from "../interfaces/request.interface";

import { ApplicationsService } from "../../applications/applications.service";
import { UserService } from "../../user/user.service";

import { ApplicationScopes } from "../../applications/enums/application-scopes.enum";

import { Maybe } from "../types/maybe.type";

const INVALID_APPLICATION_SECRET_ERROR = new UnauthorizedException("Invalid application token.");
const INSUFFICIENT_SCOPES_ERROR = new ForbiddenException("Insufficient application scopes.");

const NOT_ACTIVATED_ERROR = new ForbiddenException("The account is not activated.");
const NOT_LOGGED_IN_ERROR = new UnauthorizedException("Not logged in.");

export const APPLICATION_SCOPES = "APPLICATION_SCOPES";

export const AuthGuard = (optional = false): Type<CanActivate> => {
  @Injectable()
  class AuthMixinGuard implements CanActivate {
    constructor(
      private readonly applicationsService: ApplicationsService,
      private readonly reflector: Reflector,
      private readonly userService: UserService
    ) {}

    canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest<Request>();

      if (req.headers.authorization) {
        return this.handleApplication(ctx);
      }

      return this.handleSession(ctx);
    }

    private getMetadata<T>(key: string, ctx: ExecutionContext): Maybe<T> {
      return this.reflector.get<Maybe<T>>(key, ctx.getHandler());
    }

    private async handleApplication(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest<Request>();

      const secret = req.headers.authorization;

      if (!secret) {
        return this.throw(INVALID_APPLICATION_SECRET_ERROR);
      }

      const application = await this.applicationsService.findOne({ secret });

      if (!application) {
        return this.throw(INVALID_APPLICATION_SECRET_ERROR);
      }

      const scopes = this.getMetadata<ApplicationScopes[]>(APPLICATION_SCOPES, ctx);

      if (!scopes) {
        return this.throw(INSUFFICIENT_SCOPES_ERROR);
      }

      const hasSufficientScopes = scopes.every((scope) => application.scopes.includes(scope));

      if (!hasSufficientScopes) {
        return this.throw(INSUFFICIENT_SCOPES_ERROR);
      }

      req.application = application;
      req.user = application.user;

      return true;
    }

    private async handleSession(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest<Request>();

      if (!req.session || !req.session.user) {
        return this.throw(NOT_LOGGED_IN_ERROR);
      }

      const user = await this.userService.findOne({ id: req.session.user });

      if (!user || user.deleted) {
        return this.throw(NOT_LOGGED_IN_ERROR);
      }

      if (!user.activated) {
        return this.throw(NOT_ACTIVATED_ERROR);
      }

      req.user = user;

      return true;
    }

    private throw(exception: Error): boolean | never {
      if (optional) {
        return true;
      }

      throw exception;
    }
  }

  return mixin(AuthMixinGuard);
};
