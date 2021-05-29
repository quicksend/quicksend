import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

import { Request } from "express";

import { RequestContext } from "../contexts/request.context";

export class PasswordGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const user = RequestContext.getItem("user");

    if (!user) {
      throw new UnauthorizedException("Not logged in.");
    }

    const { password } = ctx.switchToHttp().getRequest<Request>().body;

    if (!password || !(await user.comparePassword(password))) {
      throw new UnauthorizedException("The password is incorrect.");
    }

    return true;
  }
}
