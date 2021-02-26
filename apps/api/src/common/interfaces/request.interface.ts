import { Request as ExpressRequest } from "express";
import { Session as ExpressSession } from "express-session";

import { Session } from "@quicksend/interfaces";

import { UserEntity } from "../../modules/user/user.entity";

export interface Request extends ExpressRequest {
  session: ExpressSession & Session;
  user?: UserEntity;
}
