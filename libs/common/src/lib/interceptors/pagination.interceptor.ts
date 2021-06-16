import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

import { Observable, of } from "rxjs";

import { Request, Response } from "express";

import { URLSearchParams } from "url";

export interface PaginationInterceptorOptions<T extends Array<unknown>> {
  last: (items: T[number]) => string;
  limit: (req: Request) => string;
}

export class PaginationInterceptor<T extends Array<unknown>> implements NestInterceptor {
  constructor(private readonly options: PaginationInterceptorOptions<T>) {}

  async intercept(ctx: ExecutionContext, next: CallHandler<T>): Promise<Observable<T>> {
    const items = await next.handle().toPromise();

    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const limit = this.options.limit(req);

    if (items.length > 0) {
      const lastId = this.options.last(items[items.length - 1]);

      const params = new URLSearchParams();

      params.append("after", lastId);
      params.append("limit", limit);

      res.set("Link", `<${req.path}?${params}>; rel=next`);
    }

    res.set("Pagination-Count", String(items.length));
    res.set("Pagination-Limit", limit);

    return of(items);
  }
}
