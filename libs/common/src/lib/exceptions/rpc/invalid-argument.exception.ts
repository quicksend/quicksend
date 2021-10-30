import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The client specified an invalid argument. Note that this differs
 * from `FAILED_PRECONDITION`. `INVALID_ARGUMENT` indicates arguments
 * that are problematic regardless of the state of the system
 * (e.g., a malformed file name).
 *
 * HTTP Mapping: 400 Bad Request
 */
export class InvalidArgumentRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.INVALID_ARGUMENT, message, details);
  }
}
