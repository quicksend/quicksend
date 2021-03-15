import { AsyncLocalStorage } from "async_hooks";

import { RequestContextConstructor } from "./request-context.interfaces";

export abstract class RequestContext {
  protected static readonly als = new AsyncLocalStorage<RequestContext>();

  static enter<T extends RequestContext>(
    constructor: RequestContextConstructor<T>
  ): void {
    return RequestContext.als.enterWith(new constructor());
  }

  static get<T extends RequestContext>(): T {
    return RequestContext.als.getStore() as T;
  }
}
