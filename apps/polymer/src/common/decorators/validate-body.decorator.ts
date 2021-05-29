import { UseInterceptors } from "@nestjs/common";

import { ValidateBodyInterceptor } from "../interceptors/validate-body.interceptor";

export const ValidateBody = (
  ...args: Parameters<typeof ValidateBodyInterceptor>
): MethodDecorator => {
  return UseInterceptors(ValidateBodyInterceptor(...args));
};
