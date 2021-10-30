import { ApiBearerAuth, ApiSecurity } from "@nestjs/swagger";
import { UseGuards, applyDecorators } from "@nestjs/common";

import { AuthGuard } from "../guards/auth.guard";

export const Auth = (): ClassDecorator & MethodDecorator => {
  return applyDecorators(ApiBearerAuth(), ApiSecurity("api_key"), UseGuards(AuthGuard));
};
