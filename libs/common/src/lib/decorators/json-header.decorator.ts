import { UseInterceptors, applyDecorators } from "@nestjs/common";

import { Constructor } from "../common.types";

import { JSONHeaderInterceptor } from "../interceptors/json-header.interceptor";
import { ValidateBodyInterceptor } from "../interceptors/validate-body.interceptor";

export const JSONHeader = <T>(
  dto: Constructor<T>,
  ...args: Parameters<typeof JSONHeaderInterceptor>
): ReturnType<typeof applyDecorators> => {
  return applyDecorators(
    UseInterceptors(JSONHeaderInterceptor(...args), ValidateBodyInterceptor(dto))
  );
};
