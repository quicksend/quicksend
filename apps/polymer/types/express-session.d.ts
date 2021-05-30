/* eslint-disable @typescript-eslint/no-unused-vars */

import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user?: string; // The ID of the user if authenticated
  }
}
