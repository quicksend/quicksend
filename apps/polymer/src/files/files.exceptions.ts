import { Capabilities } from "./enums/capabilities.enum";

export class FilesException extends Error {}

export class FileConflictException extends FilesException {
  constructor() {
    super("A file already exist at this location.");
  }
}

export class FileDestinationCannotBeChildrenOfSelf extends FilesException {
  constructor() {
    super("The file destination cannot be a children of itself.");
  }
}

export class FileDestinationNotFoundException extends FilesException {
  constructor() {
    super("The file destination cannot be found.");
  }
}

export class FileIncapableException extends FilesException {
  constructor(capability: Capabilities) {
    super(FileIncapableException.mapToExceptionMessage(capability));
  }

  private static mapToExceptionMessage(capability: Capabilities): string | undefined {
    const name = Capabilities[capability] as keyof typeof Capabilities;

    switch (name) {
      case "CAN_ADD_CHILDREN":
        return "The file cannot contain children.";
      case "CAN_COPY":
        return "The file cannot be copied.";
      case "CAN_DELETE":
        return "The file cannot be deleted.";
      case "CAN_LIST_CHILDREN":
        return "The file cannot list children.";
      case "CAN_MOVE":
        return "The file cannot be moved.";
      case "CAN_REMOVE_CHILDREN":
        return "The file cannot remove its children.";
      case "CAN_RENAME":
        return "The file cannot be renamed";
      case "CAN_SHARE":
        return "The file cannot be shared.";
      case "CAN_STREAM":
        return "The file cannot be streamed.";
      case "CAN_UNSHARE":
        return "The file cannot be unshared.";
    }
  }
}

export class FileNotFoundException extends FilesException {
  constructor() {
    super("The file cannot be found.");
  }
}

export class ParentIncapableException extends FilesException {
  constructor(capability: Capabilities) {
    super(ParentIncapableException.mapToExceptionMessage(capability));
  }

  private static mapToExceptionMessage(capability: Capabilities): string | undefined {
    const name = Capabilities[capability] as keyof typeof Capabilities;

    switch (name) {
      case "CAN_ADD_CHILDREN":
        return "The parent cannot contain children.";
      case "CAN_COPY":
        return "The parent cannot be copied.";
      case "CAN_DELETE":
        return "The parent cannot be deleted.";
      case "CAN_LIST_CHILDREN":
        return "The parent cannot list children.";
      case "CAN_MOVE":
        return "The parent cannot be moved.";
      case "CAN_REMOVE_CHILDREN":
        return "The parent cannot remove its children.";
      case "CAN_RENAME":
        return "The parent cannot be renamed";
      case "CAN_SHARE":
        return "The parent cannot be shared.";
      case "CAN_STREAM":
        return "The parent cannot be streamed.";
      case "CAN_UNSHARE":
        return "The parent cannot be unshared.";
    }
  }
}
