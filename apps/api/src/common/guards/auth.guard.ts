import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

import { UserNotLoggedInException } from "../../auth/auth.exceptions";

import { UserService } from "../../user/user.service";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";
export const AUTH_GUARD_SCOPES = "AUTH_GUARD_SCOPES";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    return this._handleSession(req);
  }

  private async _handleSession(req: Request) {
    if (!req.session || !req.session.uid) {
      throw new UserNotLoggedInException();
    }

    const user = await this.userService.findOne({ id: req.session.uid });

    if (!user) {
      throw new UserNotLoggedInException();
    }

    req.user = user;

    return true;
  }
}