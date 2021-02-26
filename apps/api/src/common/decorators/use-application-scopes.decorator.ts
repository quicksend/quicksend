import { CustomDecorator, SetMetadata } from "@nestjs/common";

import { ApplicationScopesEnum } from "../../modules/applications/enums/application-scopes.enum";

export const REQUIRED_APPLICATION_SCOPES = "REQUIRED_APPLICATION_SCOPES";

export const UseApplicationScopes = (
  ...scopes: ApplicationScopesEnum[]
): CustomDecorator<string> => SetMetadata(REQUIRED_APPLICATION_SCOPES, scopes);
