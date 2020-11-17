import { CustomDecorator, SetMetadata } from "@nestjs/common";

import { AUTH_GUARD_OPTIONAL } from "../guards/auth.guard";

export const OptionalAuth = (optional = true): CustomDecorator<string> =>
  SetMetadata(AUTH_GUARD_OPTIONAL, optional);
