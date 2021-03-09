import { Request as ExpressRequest } from "express";

import { Session } from "./session.interface";

import { UserEntity } from "../../user/user.entity";

export interface Request extends ExpressRequest {
  session: Session;
  user?: UserEntity;
}
