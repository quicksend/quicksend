import { SetMetadata } from "@nestjs/common";

import { APPLICATION_SCOPES } from "../guards/auth.guard";

import { ApplicationScopes } from "../../applications/enums/application-scopes.enum";

export const UseScopes = (...scopes: ApplicationScopes[]): ClassDecorator & MethodDecorator => {
  return SetMetadata(APPLICATION_SCOPES, scopes);
};
