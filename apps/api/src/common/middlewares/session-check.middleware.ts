import { Injectable, InternalServerErrorException, NestMiddleware } from "@nestjs/common";

import { NextFunction, Request, Response } from "express";

@Injectable()
export class SessionCheckMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session) {
      throw new InternalServerErrorException("Lost connection to redis for sessions");
    }

    next();
  }
}
