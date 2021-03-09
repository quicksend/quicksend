export class FoldersException extends Error {}

export class CantDeleteFolderException extends FoldersException {
  constructor() {
    super("This folder cannot be deleted.");
  }
}

export class CantFindDestinationFolderException extends FoldersException {
  constructor() {
    super("The destination folder cannot be found.");
  }
}

export class CantFindFolderException extends FoldersException {
  constructor() {
    super("This folder cannot be found.");
  }
}

export class CantMoveFolderException extends FoldersException {
  constructor() {
    super("This folder cannot be moved.");
  }
}

export class CantMoveFolderIntoChildrenException extends FoldersException {
  constructor() {
    super("The destination folder cannot be a subfolder of itself.");
  }
}

export class CantMoveFolderIntoItselfException extends FoldersException {
  constructor() {
    super("The destination folder cannot be itself.");
  }
}

export class CantRenameFolderException extends FoldersException {
  constructor() {
    super("The folder cannot be renamed.");
  }
}

export class FolderConflictException extends FoldersException {
  constructor() {
    super("A folder already exist at this location.");
  }
}
