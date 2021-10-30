import { RequestContextInterceptor as BaseRequestContextInterceptor } from "@alexy4744/nestjs-request-context";

import { RequestContext } from "../contexts/request.context";

export const RequestContextInterceptor = BaseRequestContextInterceptor(RequestContext);
