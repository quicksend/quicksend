export class FileException extends Error {}

export class CantFindFileDestinationException extends FileException {
  constructor() {
    super("The destination folder cannot be found.");
  }
}

export class CantFindFileException extends FileException {
  constructor() {
    super("This file cannot be found.");
  }
}

export class FileConflictException extends FileException {
  constructor() {
    super("A file already exist at this location.");
  }
}
