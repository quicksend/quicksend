import { UseInterceptors } from "@nestjs/common";

import { TransactionalInterceptor } from "../interceptors/transactional.interceptor";

export const Transactional = (): ClassDecorator & MethodDecorator => {
  return UseInterceptors(TransactionalInterceptor);
};
