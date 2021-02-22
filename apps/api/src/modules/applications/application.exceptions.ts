export class ApplicationException extends Error {}

export class CantFindApplicationException extends ApplicationException {
  constructor() {
    super("This application cannot be found.");
  }
}

export class ApplicationConflictException extends ApplicationException {
  constructor() {
    super("An application already exist with this name.");
  }
}
