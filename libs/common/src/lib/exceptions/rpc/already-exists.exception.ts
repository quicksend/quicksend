import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The entity that a client attempted to create (e.g., file or directory)
 * already exists.
 *
 * HTTP Mapping: 409 Conflict
 */
export class AlreadyExistsRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.ALREADY_EXISTS, message, details);
  }
}
