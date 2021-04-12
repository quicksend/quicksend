export class FilesException extends Error {}

export class CantFindFileException extends FilesException {
  constructor() {
    super("The file cannot be found.");
  }
}

export class CantFindFileDestinationException extends FilesException {
  constructor() {
    super("The file destination cannot be found.");
  }
}

export class CantFindFileInvitationException extends FilesException {
  constructor() {
    super("The file invitation cannot be found.");
  }
}

export class CantFindFileInvitee extends FilesException {
  constructor() {
    super("The file invitee cannot be found.");
  }
}

export class FileConflictException extends FilesException {
  constructor() {
    super("A file already exist at this location.");
  }
}

export class FileInviteeCannotBeOwner extends FilesException {
  constructor() {
    super("The file invitee cannot be the owner of the file.");
  }
}

export class FileInviteeCannotBeSelf extends FilesException {
  constructor() {
    super("The file invitee cannot be yourself.");
  }
}

export class InsufficientPrivilegesException extends FilesException {
  constructor() {
    super("Insufficient privileges for this file.");
  }
}
