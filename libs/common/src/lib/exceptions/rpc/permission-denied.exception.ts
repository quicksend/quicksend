import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * The caller does not have permission to execute the specified
 * operation. `PERMISSION_DENIED` must not be used for rejections
 * caused by exhausting some resource (use `RESOURCE_EXHAUSTED`
 * instead for those errors). `PERMISSION_DENIED` must not be
 * used if the caller can not be identified (use `UNAUTHENTICATED`
 * instead for those errors). This error code does not imply the
 * request is valid or the requested entity exists or satisfies
 * other pre-conditions.
 *
 * HTTP Mapping: 403 Forbidden
 */
export class PermissionDeniedRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.PERMISSION_DENIED, message, details);
  }
}
