import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { Request } from "../../common/interfaces/request.interface";

import { AuthGuard } from "./auth.guard";

@Injectable()
export class AdminGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest<Request>();

    if (!req.user || !req.user.admin) {
      throw new UnauthorizedException("You are not an admin!");
    }

    return true;
  }
}
