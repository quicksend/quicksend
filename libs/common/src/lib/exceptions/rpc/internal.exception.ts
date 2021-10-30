import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * Internal errors. This means that some invariants expected by the
 * underlying system have been broken. This error code is reserved
 * for serious errors.
 *
 * HTTP Mapping: 500 Internal Server Error
 */
export class InternalRpcException<T = unknown> extends RpcException<T> {
  constructor(message = "An error has occurred, please try again later!", details?: T) {
    super(RpcErrorCode.INTERNAL, message, details);
  }
}
