export class AuthenticationException extends Error {}

export class InvalidLoginCredentialsException extends AuthenticationException {
  constructor() {
    super("Invalid login credentials!");
  }
}

export class UserNotActivatedException extends AuthenticationException {
  constructor() {
    super("Your account is not activated!");
  }
}
