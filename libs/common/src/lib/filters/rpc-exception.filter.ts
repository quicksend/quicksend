import { ArgumentsHost, Catch } from "@nestjs/common";

import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";

import { Observable } from "rxjs";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface RpcExceptionResponseBody<T extends Record<string, unknown> = {}> {
  error: T & {
    code: string;
    message: string;
  };
  timestamp: number;
}

@Catch(RpcException)
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<unknown> {
    const error: RpcExceptionResponseBody = {
      error: {
        code: "RPC_EXCEPTION",
        message: exception.message
      },
      timestamp: Date.now()
    };

    return super.catch(error, host);
  }
}
