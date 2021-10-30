import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The request does not have valid authentication credentials for the
 * operation.
 *
 * HTTP Mapping: 401 Unauthorized
 */
export class UnauthenticatedRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.UNAUTHENTICATED, message, details);
  }
}
