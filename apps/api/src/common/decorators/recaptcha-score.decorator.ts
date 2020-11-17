import { CustomDecorator, SetMetadata } from "@nestjs/common";

import { RECAPTCHA_SCORE_KEY } from "../guards/recaptcha.guard";

export const RecaptchaScore = (score: number): CustomDecorator<string> =>
  SetMetadata(RECAPTCHA_SCORE_KEY, score);
