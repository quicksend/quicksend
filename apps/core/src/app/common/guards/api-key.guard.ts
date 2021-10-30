import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { Request } from "express";

import { RequestContext } from "../contexts/request.context";

import { ApplicationsService } from "../../applications/applications.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly applicationsService: ApplicationsService) {}

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
      throw new UnauthorizedException("Invalid API key.");
    }

    const [scheme, secret] = authorization.split(" ");

    if (scheme !== "App") {
      throw new UnauthorizedException("Invalid authentication scheme.");
    }

    const application = await this.applicationsService.findOne({
      secret
    });

    if (!application) {
      throw new UnauthorizedException("Invalid API key.");
    }

    const store = RequestContext.getStore();

    if (!store) {
      throw new Error(`Request context store is ${store}`);
    }

    store.application = application.id;
    store.user = application.createdBy;

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleRpcContext(_ctx: ExecutionContext): Promise<boolean> {
    return true;
  }
}
