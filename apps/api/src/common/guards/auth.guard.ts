import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { atob } from "@quicksend/utils";

import { Request } from "../interfaces/request.interface";

import { ApplicationScopesEnum } from "../../modules/applications/enums/application-scopes.enum";

import { ApplicationsService } from "../../modules/applications/applications.service";
import { UserService } from "../../modules/user/user.service";

import { REQUIRED_APPLICATION_SCOPES } from "../../common/decorators/use-application-scopes.decorator";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly reflector: Reflector,
    private readonly userService: UserService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const optional = this._getMetadata<boolean>(AUTH_GUARD_OPTIONAL, ctx);

    const req = ctx.switchToHttp().getRequest<Request>();

    try {
      return req.headers.authorization
        ? await this._handleApplicationToken(req, ctx)
        : await this._handleSession(req);
    } catch (error) {
      if (!optional) {
        throw error;
      }

      return true;
    }
  }

  private async _handleApplicationToken(
    req: Request,
    ctx: ExecutionContext
  ): Promise<boolean> {
    const scopes = this._getMetadata<ApplicationScopesEnum[]>(
      REQUIRED_APPLICATION_SCOPES,
      ctx
    );

    const token = req.headers.authorization && atob(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("Invalid application token!");
    }

    const [id, secret] = token.split(":");

    if (!id || !secret) {
      throw new UnauthorizedException("Invalid application token!");
    }

    const application = await this.applicationsService.findOne({ id });

    if (!application || application.secret !== secret) {
      throw new UnauthorizedException("Invalid application token!");
    }

    // Only allow routes that has UseScopes() to allow the usage of an application token
    const hasSufficientScopes = scopes && scopes.every((scope) => scopes.includes(scope)); // prettier-ignore

    if (!hasSufficientScopes) {
      throw new ForbiddenException("Insufficient scopes!");
    }

    req.user = application.user;

    return true;
  }

  private async _handleSession(req: Request): Promise<boolean> {
    if (!req.session || !req.session.uid) {
      throw new UnauthorizedException("You are not logged in!");
    }

    const user = await this.userService.findOne({ id: req.session.uid });

    if (!user) {
      throw new UnauthorizedException("You are not logged in!");
    }

    if (!user.activated) {
      throw new ForbiddenException("Your account is not activated!");
    }

    req.user = user;

    return true;
  }

  private _getMetadata<T>(key: string, ctx: ExecutionContext): T | undefined {
    return this.reflector.get<T | undefined>(key, ctx.getHandler());
  }
}
