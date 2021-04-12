import { UseGuards, applyDecorators, SetMetadata } from "@nestjs/common";

import { AuthGuard, APPLICATION_SCOPES } from "../guards/auth.guard";

import { ApplicationScopes } from "../../applications/enums/application-scopes.enum";

interface AuthDecoratorOptions {
  optional?: boolean;
  scopes?: ApplicationScopes[];
}

export const Auth = (options?: AuthDecoratorOptions): ReturnType<typeof applyDecorators> => {
  const optional = options && options.optional;
  const scopes = (options && options.scopes) || [];

  const guard = AuthGuard(optional);

  if (scopes.length) {
    return applyDecorators(SetMetadata(APPLICATION_SCOPES, scopes), UseGuards(guard));
  }

  return applyDecorators(UseGuards(guard));
};
