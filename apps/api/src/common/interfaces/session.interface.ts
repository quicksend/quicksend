import { Session as BaseSession } from "express-session";

export interface Session extends BaseSession {
  user: string;
}
