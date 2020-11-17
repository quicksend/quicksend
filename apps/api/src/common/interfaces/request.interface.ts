import { Session } from "@quicksend/interfaces";
import { UserEntity } from "../../user/entities/user.entity";

export interface Request extends Express.Request {
  session: Express.Session & Partial<Session>;
  user?: UserEntity;
}
