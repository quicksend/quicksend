import { UseInterceptors } from "@nestjs/common";

import { TransactionalInterceptor } from "../interceptors/transactional.interceptor";

export const Transactional = (): MethodDecorator => {
  return UseInterceptors(TransactionalInterceptor);
};
