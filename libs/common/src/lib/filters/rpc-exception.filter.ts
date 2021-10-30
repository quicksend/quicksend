import { ArgumentsHost, Catch } from "@nestjs/common";

import { BaseRpcExceptionFilter, RpcException as BaseRpcException } from "@nestjs/microservices";

import { Observable } from "rxjs";

import { RpcException } from "../exceptions/rpc.exception";

@Catch(RpcException)
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<unknown> {
    return super.catch(new BaseRpcException(exception), host);
  }
}
