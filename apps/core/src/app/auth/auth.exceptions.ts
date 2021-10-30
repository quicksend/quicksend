import { InvalidArgumentRpcException, UnauthenticatedRpcException } from "@quicksend/common";

export class InvalidAccessTokenException extends InvalidArgumentRpcException {
  constructor() {
    super("Invalid access token.");
  }
}

export class InvalidRefreshTokenException extends InvalidArgumentRpcException {
  constructor() {
    super("Invalid refresh token.");
  }
}

export class InvalidUserCredentialsException extends UnauthenticatedRpcException {
  constructor() {
    super("Invalid user credentials.");
  }
}
