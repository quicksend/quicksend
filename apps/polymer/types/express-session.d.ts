import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    user?: string; // The ID of the user if authenticated
  }

  export = session;
}
