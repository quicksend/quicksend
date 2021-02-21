export class FolderException extends Error {}

export class CantDeleteFolderException extends FolderException {
  constructor() {
    super("This folder cannot be deleted.");
  }
}

export class CantFindDestinationFolderException extends FolderException {
  constructor() {
    super("The destination folder cannot be found.");
  }
}

export class CantFindFolderException extends FolderException {
  constructor() {
    super("This folder cannot be found.");
  }
}

export class CantMoveFolderException extends FolderException {
  constructor() {
    super("This folder cannot be moved.");
  }
}

export class CantMoveFolderIntoChildrenException extends FolderException {
  constructor() {
    super("The destination folder cannot be a subfolder of itself.");
  }
}

export class CantMoveFolderIntoItselfException extends FolderException {
  constructor() {
    super("The destination folder cannot be itself.");
  }
}

export class FolderConflictException extends FolderException {
  constructor() {
    super("A folder already exist at this location.");
  }
}
