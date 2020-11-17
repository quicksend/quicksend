import { ExecutionContext, Injectable } from "@nestjs/common";

import { AuthGuard } from "./auth.guard";

import { UserNotAdminException } from "../../auth/auth.exceptions";

import { Request } from "../../common/interfaces/request.interface";

@Injectable()
export class AdminGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest<Request>();

    if (!req.user || !req.user.admin) {
      throw new UserNotAdminException();
    }

    return true;
  }
}
