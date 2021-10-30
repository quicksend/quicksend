import { BaseRequestContext } from "@alexy4744/nestjs-request-context";

export class RequestContext extends BaseRequestContext<RequestContext>() {
  application?: string;
  user?: string;
}
