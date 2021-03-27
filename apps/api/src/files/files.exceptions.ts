export class FilesException extends Error {}

export class CantAccessFileException extends FilesException {
  constructor() {
    super("This file cannot be accessed.");
  }
}

export class CantFindFileException extends FilesException {
  constructor() {
    super("This file cannot be found.");
  }
}

export class CantFindFilePolicyException extends FilesException {
  constructor() {
    super("This file policy cannot be found.");
  }
}

export class FileBeneficiaryCannotBeOwner extends FilesException {
  constructor() {
    super("The file policy beneficiary cannot be the owner of the file.");
  }
}

export class FileConflictException extends FilesException {
  constructor() {
    super("A file already exist at this location.");
  }
}
