import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super("Invalid login credentials!");
  }
}

export class UserNotActivatedException extends ForbiddenException {
  constructor() {
    super("Please activate your account first!");
  }
}

export class UserNotAdminException extends UnauthorizedException {
  constructor() {
    super("You are not an admin!");
  }
}

export class UserNotLoggedInException extends UnauthorizedException {
  constructor() {
    super("You are not logged in!");
  }
}
