import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { Request } from "../interfaces/request.interface";

import { UserService } from "../../modules/user/user.service";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";
export const AUTH_GUARD_SCOPES = "AUTH_GUARD_SCOPES";

const NOT_LOGGED_IN_ERROR = new UnauthorizedException("You are not logged in!");
const NOT_ACTIVATED_ERROR = new ForbiddenException("Your account is not activated!"); // prettier-ignore

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    return this._handleSession(req);
  }

  private async _handleSession(req: Request) {
    if (!req.session || !req.session.uid) {
      throw NOT_LOGGED_IN_ERROR;
    }

    const user = await this.userService.findOne({ id: req.session.uid });

    if (!user) {
      throw NOT_LOGGED_IN_ERROR;
    }

    if (!user.activated) {
      throw NOT_ACTIVATED_ERROR;
    }

    req.user = user;

    return true;
  }
}
