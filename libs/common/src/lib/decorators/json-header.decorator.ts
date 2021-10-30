import { UseInterceptors } from "@nestjs/common";

import { Constructor } from "type-fest";

import { JSONHeaderInterceptor } from "../interceptors/json-header.interceptor";
import { ValidateBodyInterceptor } from "../interceptors/validate-body.interceptor";

export const JSONHeader = <T>(
  dto: Constructor<T>,
  ...args: Parameters<typeof JSONHeaderInterceptor>
): MethodDecorator => {
  return UseInterceptors(JSONHeaderInterceptor(...args), ValidateBodyInterceptor(dto));
};
