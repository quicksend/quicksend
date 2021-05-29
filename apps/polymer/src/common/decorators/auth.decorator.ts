import { UseGuards, applyDecorators } from "@nestjs/common";

import { AuthGuard } from "../guards/auth.guard";

import { ApplicationScopes } from "../../applications/enums/application-scopes.enum";

import { UseScopes } from "./use-scopes.decorator";

interface AuthDecoratorOptions {
  optional?: boolean;
  scopes?: ApplicationScopes[];
}

export const Auth = (options?: AuthDecoratorOptions): ReturnType<typeof applyDecorators> => {
  const optional = options && options.optional;
  const scopes = (options && options.scopes) || [];

  const guard = AuthGuard(optional);

  if (scopes.length) {
    return applyDecorators(UseGuards(guard), UseScopes(...scopes));
  }

  return applyDecorators(UseGuards(guard));
};
