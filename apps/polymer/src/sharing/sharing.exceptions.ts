import { Privileges } from "./enums/privileges.enum";

export class SharingException extends Error {}

export class InsufficientPrivilegesException extends SharingException {
  constructor(...privileges: Privileges[]) {
    const friendlyPrivileges = privileges
      .map((privilege) => `'${Privileges[privilege]}'`)
      .join(", ");

    super(
      `Insufficient privileges to perform the requested action. Missing ${friendlyPrivileges}.`
    );
  }
}

export class InvitationConflictException extends SharingException {
  constructor() {
    super("An invitation for the invitee already exist at this location.");
  }
}

export class InvitationNotFoundException extends SharingException {
  constructor() {
    super("Invitation cannot be found.");
  }
}

export class InviteeCannotBeOwnerException extends SharingException {
  constructor() {
    super("Invitee cannot be the owner of the file.");
  }
}

export class InviteeCannotBeSelfException extends SharingException {
  constructor() {
    super("Invitee cannot be yourself.");
  }
}

export class InviteeNotFoundException extends SharingException {
  constructor() {
    super("Invitee cannot be found.");
  }
}
