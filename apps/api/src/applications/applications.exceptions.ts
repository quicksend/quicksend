export class ApplicationsException extends Error {}

export class ApplicationConflictException extends ApplicationsException {
  constructor() {
    super("An application already exist with this name.");
  }
}

export class CantFindApplicationException extends ApplicationsException {
  constructor() {
    super("This application cannot be found.");
  }
}
