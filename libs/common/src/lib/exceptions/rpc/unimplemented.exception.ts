import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The operation is not implemented or is not supported/enabled in this
 * service.
 *
 * HTTP Mapping: 501 Not Implemented
 */
export class UnimplementedRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.UNIMPLEMENTED, message, details);
  }
}
