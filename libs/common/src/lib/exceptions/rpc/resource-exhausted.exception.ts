import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * Some resource has been exhausted, perhaps a per-user quota, or
 * perhaps the entire file system is out of space.
 *
 * HTTP Mapping: 429 Too Many Requests
 */
export class ResourceExhaustedRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.RESOURCE_EXHAUSTED, message, details);
  }
}
