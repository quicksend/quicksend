import { UseGuards } from "@nestjs/common";

import { RecaptchaGuard, RecaptchaGuardOptions } from "../guards/recaptcha.guard";

export const Recaptcha = (options?: RecaptchaGuardOptions): ClassDecorator & MethodDecorator => {
  return UseGuards(RecaptchaGuard(options));
};
