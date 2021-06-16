import { InvitationPrivileges } from "@quicksend/types";

import { RpcException } from "@nestjs/microservices";

export class InvitationsException extends RpcException {}

export class InsufficientPrivilegesException extends InvitationsException {
  constructor(...privileges: InvitationPrivileges[]) {
    const friendlyPrivileges = privileges
      .map((privilege) => `'${InvitationPrivileges[privilege]}'`)
      .join(", ");

    super(
      `Insufficient privileges to perform the requested action. Missing ${friendlyPrivileges}.`
    );
  }
}

export class InvitationConflictException extends InvitationsException {
  constructor() {
    super("An invitation for the invitee already exist at this location.");
  }
}

export class InvitationNotFoundException extends InvitationsException {
  constructor() {
    super("Invitation cannot be found.");
  }
}

export class InviteeCannotBeOwnerException extends InvitationsException {
  constructor() {
    super("Invitee cannot be the owner of the file.");
  }
}

export class InviteeCannotBeSelfException extends InvitationsException {
  constructor() {
    super("Invitee cannot be yourself.");
  }
}

export class InviteeNotFoundException extends InvitationsException {
  constructor() {
    super("Invitee cannot be found.");
  }
}
