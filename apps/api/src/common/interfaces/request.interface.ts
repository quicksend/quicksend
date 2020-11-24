import { Session as ExpressSession } from "express-session";

import { Session } from "@quicksend/interfaces";

import { UserEntity } from "../../user/user.entity";

export interface Request extends Express.Request {
  session: ExpressSession & Partial<Session>;
  user?: UserEntity;
}
