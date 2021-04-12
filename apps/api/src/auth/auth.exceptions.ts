export class AuthException extends Error {}

export class InvalidLoginCredentialsException extends AuthException {
  constructor() {
    super("Invalid login credentials!");
  }
}

export class UserNotActivatedException extends AuthException {
  constructor() {
    super("The user account is not activated.");
  }
}
