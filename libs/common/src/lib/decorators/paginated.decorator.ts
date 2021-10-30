import { UseInterceptors } from "@nestjs/common";

import {
  PaginationInterceptor,
  PaginationInterceptorOptions
} from "../interceptors/pagination.interceptor";

export const Paginated = <T>(options: PaginationInterceptorOptions<T>): MethodDecorator => {
  return UseInterceptors(new PaginationInterceptor<T>(options));
};
