import { UseGuards } from "@nestjs/common";

import { OrGuard } from "@quicksend/common";

import { ApiKeyGuard } from "../guards/api-key.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

export const Auth = (): ClassDecorator & MethodDecorator => {
  return UseGuards(OrGuard(ApiKeyGuard, JwtAuthGuard));
};
