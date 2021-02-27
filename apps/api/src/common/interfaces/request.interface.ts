import { Request as ExpressRequest } from "express";
import { Session as ExpressSession } from "express-session";

import { Multiparter } from "@quicksend/multiparter";
import { Session } from "@quicksend/interfaces";

import { UserEntity } from "../../modules/user/user.entity";

export interface Request extends ExpressRequest {
  multiparter?: Multiparter;
  session: ExpressSession & Session;
  user?: UserEntity;
}
