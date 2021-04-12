import { Request as BaseRequest } from "express";

import { Session } from "./session.interface";

import { Application } from "../../applications/entities/application.entity";
import { User } from "../../user/entities/user.entity";

export interface Request extends BaseRequest {
  application?: Application;
  session: Session;
  user?: User;
}
