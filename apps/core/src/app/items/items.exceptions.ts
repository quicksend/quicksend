import {
  AlreadyExistsRpcException,
  FailedPreconditionRpcException,
  InvalidArgumentRpcException,
  NotFoundRpcException,
  PermissionDeniedRpcException
} from "@quicksend/common";

export class AsyncJobNotFoundException extends NotFoundRpcException {
  constructor(id: string) {
    super(`Async job '${id}' does not exist`);
  }
}

export class InsufficientPrivilegesException extends PermissionDeniedRpcException {
  constructor(item: string) {
    super(`Insufficient privileges to access item '${item}'`);
  }
}

export class InvitationConflictException extends AlreadyExistsRpcException {
  constructor() {
    super("An invitation already exists for this user");
  }
}

export class InvitationNotFoundException extends NotFoundRpcException {
  constructor() {
    super("Invitation does not exist");
  }
}

export class InvitedByAncestorException extends FailedPreconditionRpcException {
  constructor() {
    super("This file is invited by its ancestor");
  }
}

export class InviteeCannotBeInviterException extends InvalidArgumentRpcException {
  constructor() {
    super("The invitee cannot be the inviter of the item");
  }
}

export class InviteeCannotBeOwnerException extends InvalidArgumentRpcException {
  constructor() {
    super("The invitee cannot be the owner of the item");
  }
}

export class InviteeNotFoundException extends NotFoundRpcException {
  constructor() {
    super("The invitee is not a valid user");
  }
}

export class ItemConflictException extends AlreadyExistsRpcException {
  constructor(source: string, destination: string) {
    super(`Item '${source}' already exists at '${destination}'`);
  }
}

export class ItemLockedByUserException extends PermissionDeniedRpcException {
  constructor(item: string, lockOwner: string) {
    super(`Item '${item}' is locked by '${lockOwner}'`);
  }
}

export class ItemNotFoundException extends NotFoundRpcException {
  constructor() {
    super("Item does not exist");
  }
}

export class ItemNotTrashedException extends FailedPreconditionRpcException {
  constructor(item: string) {
    super(`Item '${item}' is not in the trash`);
  }
}

export class ItemOperationNotPermittedException extends PermissionDeniedRpcException {
  constructor(item: string, operation?: string) {
    operation
      ? super(`Item operation '${operation}' is not permitted on '${item}'`)
      : super(`Item operation is not permitted on '${item}'`);
  }
}

export class LockCannotBeRemovedByUserException extends PermissionDeniedRpcException {
  constructor(item: string) {
    super(`Lock for ${item} can only be removed by the item owner or the lock owner`);
  }
}

export class LockNotFoundException extends NotFoundRpcException {
  constructor(item: string) {
    super(`Lock for '${item}' does not exist`);
  }
}

export class VersionNotFoundException extends NotFoundRpcException {
  constructor(item: string) {
    super(`Version for '${item}' does not exist`);
  }
}
