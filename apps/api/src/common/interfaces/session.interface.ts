import { Session as ExpressSession } from "express-session";

export interface Session extends ExpressSession {
  uid: string;
}
