export class AuthException extends Error {}

export class InvalidLoginCredentialsException extends AuthException {
  constructor() {
    super("Invalid login credentials!");
  }
}
