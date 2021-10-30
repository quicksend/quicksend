import { HttpStatus as HttpStatusCode } from "@nestjs/common";
import { RpcException as BaseRpcException } from "@nestjs/microservices";

import { RpcErrorCode } from "../enums/rpc-error-code.enum";

export class RpcException<T = unknown> extends BaseRpcException {
  readonly code: RpcErrorCode;
  readonly details?: T;
  readonly status: string;

  constructor(code: RpcErrorCode, message: string, details?: T) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = RpcErrorCode[code];
  }

  static getHttpStatusCode(errorCode: RpcErrorCode): HttpStatusCode {
    switch (errorCode) {
      case RpcErrorCode.ALREADY_EXISTS:
        return HttpStatusCode.CONFLICT;

      case RpcErrorCode.FAILED_PRECONDITION:
        return HttpStatusCode.BAD_REQUEST;

      case RpcErrorCode.INTERNAL:
        return HttpStatusCode.INTERNAL_SERVER_ERROR;

      case RpcErrorCode.INVALID_ARGUMENT:
        return HttpStatusCode.BAD_REQUEST;

      case RpcErrorCode.NOT_FOUND:
        return HttpStatusCode.NOT_FOUND;

      case RpcErrorCode.OUT_OF_RANGE:
        return HttpStatusCode.BAD_REQUEST;

      case RpcErrorCode.PERMISSION_DENIED:
        return HttpStatusCode.FORBIDDEN;

      case RpcErrorCode.RESOURCE_EXHAUSTED:
        return HttpStatusCode.TOO_MANY_REQUESTS;

      case RpcErrorCode.UNAUTHENTICATED:
        return HttpStatusCode.UNAUTHORIZED;

      case RpcErrorCode.UNAVAILABLE:
        return HttpStatusCode.SERVICE_UNAVAILABLE;

      case RpcErrorCode.UNIMPLEMENTED:
        return HttpStatusCode.NOT_IMPLEMENTED;

      case RpcErrorCode.UNKNOWN:
        return HttpStatusCode.INTERNAL_SERVER_ERROR;
    }
  }
}
