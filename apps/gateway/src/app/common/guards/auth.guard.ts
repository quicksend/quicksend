import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Request } from "express";

import { lastValueFrom } from "rxjs";

import { NATS_CLIENT } from "../../app.constants";

import { RequestContext } from "../contexts/request.context";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(NATS_CLIENT)
    private readonly client: NatsClient
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const allowed = (await this.handleAccessToken(ctx)) || (await this.handleApiKey(ctx));

    if (!allowed) {
      throw new UnauthorizedException("Invalid access token");
    }

    return true;
  }

  private async handleAccessToken(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();

    const { authorization } = req.headers;

    if (!authorization) {
      return false;
    }

    const [scheme, accessToken] = authorization.split(" ");

    if (scheme !== "Bearer") {
      return false;
    }

    const payload = await lastValueFrom(
      this.client.send("auth.validate.access-token", {
        accessToken
      })
    );

    if (!payload) {
      return false;
    }

    const store = RequestContext.getStore();

    if (!store) {
      throw new Error("Request context store is not entered");
    }

    store.user = payload.user;

    return true;
  }

  private async handleApiKey(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();

    const { authorization } = req.headers;

    if (!authorization) {
      return false;
    }

    const [scheme, secret] = authorization.split(" ");

    if (scheme !== "Bearer") {
      return false;
    }

    const application = await lastValueFrom(
      this.client.send("applications.application.find", {
        secret
      })
    );

    if (!application) {
      return false;
    }

    const store = RequestContext.getStore();

    if (!store) {
      throw new Error("Request context store is not entered");
    }

    store.application = application.id;
    store.user = application.createdBy;

    return true;
  }
}
