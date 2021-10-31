import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Capabilities {
  @Property()
  canAddChildren = false;

  @Property()
  canCopy = false;

  @Property()
  canDelete = false;

  @Property()
  canDeleteChildren = false;

  @Property()
  canDownload = false;

  @Property()
  canListChildren = false;

  @Property()
  canLock = false;

  @Property()
  canMove = false;

  @Property()
  canRename = false;

  @Property()
  canRestore = false;

  @Property()
  canShare = false;

  @Property()
  canTransfer = false;

  @Property()
  canTrash = false;

  @Property()
  canTrashChildren = false;

  @Property()
  canUntrash = false;

  @Property()
  canUnshare = false;

  constructor(capabilities: Partial<Capabilities> = {}) {
    Object.assign(this, capabilities);
  }
}
