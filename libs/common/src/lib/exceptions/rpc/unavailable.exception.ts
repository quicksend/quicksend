import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The service is currently unavailable. This is most likely a
 * transient condition, which can be corrected by retrying with
 * a backoff. Note that it is not always safe to retry
 * non-idempotent operations.
 *
 * See the guidelines above for deciding between `FAILED_PRECONDITION`,
 * `ABORTED`, and `UNAVAILABLE`.
 *
 * HTTP Mapping: 503 Service Unavailable
 */
export class UnavailableRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.UNAVAILABLE, message, details);
  }
}
