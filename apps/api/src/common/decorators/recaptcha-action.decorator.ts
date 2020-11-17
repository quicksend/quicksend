import { CustomDecorator, SetMetadata } from "@nestjs/common";

import { RECAPTCHA_ACTION_KEY } from "../guards/recaptcha.guard";

export const RecaptchaAction = (action: string): CustomDecorator<string> =>
  SetMetadata(RECAPTCHA_ACTION_KEY, action);
