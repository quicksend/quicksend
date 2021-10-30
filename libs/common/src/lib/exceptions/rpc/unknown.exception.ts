import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * Unknown error. For example, this error may be returned when
 * a `Status` value received from another address space belongs to
 * an error space that is not known in this address space.  Also
 * errors raised by APIs that do not return enough error information
 * may be converted to this error.
 *
 * HTTP Mapping: 500 Internal Server Error
 */
export class UnknownRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.UNKNOWN, message, details);
  }
}
