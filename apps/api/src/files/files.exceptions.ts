export class FilesException extends Error {}

export class CantFindFileException extends FilesException {
  constructor() {
    super("This file cannot be found.");
  }
}

export class FileConflictException extends FilesException {
  constructor() {
    super("A file already exist at this location.");
  }
}
