import { UseInterceptors } from "@nestjs/common";

import {
  PaginationInterceptor,
  PaginationInterceptorOptions
} from "../interceptors/pagination.interceptor";

export const Paginated = <T extends Array<unknown>>(
  options: PaginationInterceptorOptions<T>
): MethodDecorator => {
  return UseInterceptors(new PaginationInterceptor<T>(options));
};
