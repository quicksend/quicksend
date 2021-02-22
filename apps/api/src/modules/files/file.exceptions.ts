export class FileException extends Error {}

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
