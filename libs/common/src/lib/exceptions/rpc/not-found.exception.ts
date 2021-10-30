import { RpcException } from "../rpc.exception";

import { RpcErrorCode } from "../../enums/rpc-error-code.enum";

/**
 * Some requested entity (e.g., file or directory) was not found.
 *
 * Note to server developers: if a request is denied for an entire class
 * of users, such as gradual feature rollout or undocumented whitelist,
 * `NOT_FOUND` may be used. If a request is denied for some users within
 * a class of users, such as user-based access control, `PERMISSION_DENIED`
 * must be used.
 *
 * HTTP Mapping: 404 Not Found
 */
export class NotFoundRpcException<T = unknown> extends RpcException<T> {
  constructor(message: string, details?: T) {
    super(RpcErrorCode.NOT_FOUND, message, details);
  }
}
