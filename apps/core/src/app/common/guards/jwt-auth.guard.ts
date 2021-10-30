import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { Request } from "express";

import { RequestContext } from "../contexts/request.context";

import { AuthService } from "../../auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const type = ctx.getType();

    switch (type) {
      case "http":
        return this.handleHttpContext(ctx);

      case "rpc":
        return this.handleRpcContext(ctx);

      default:
        return false;
    }
  }

  private async handleHttpContext(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();

    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException("Invalid JWT token.");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer") {
      throw new UnauthorizedException("Invalid authentication scheme.");
    }

    const payload = await this.authService.validateAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException("Invalid JWT token.");
    }

    const store = RequestContext.getStore();

    if (!store) {
      throw new Error(`Request context store is ${store}`);
    }

    store.user = payload.user;

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleRpcContext(_ctx: ExecutionContext): Promise<boolean> {
    return true;
  }
}
