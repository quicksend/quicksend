import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Capabilities {
  @Property()
  canAddChildren: boolean = false;

  @Property()
  canCopy: boolean = false;

  @Property()
  canDelete: boolean = false;

  @Property()
  canDeleteChildren: boolean = false;

  @Property()
  canDownload: boolean = false;

  @Property()
  canListChildren: boolean = false;

  @Property()
  canLock: boolean = false;

  @Property()
  canMove: boolean = false;

  @Property()
  canRename: boolean = false;

  @Property()
  canRestore: boolean = false;

  @Property()
  canShare: boolean = false;

  @Property()
  canTransfer: boolean = false;

  @Property()
  canTrash: boolean = false;

  @Property()
  canTrashChildren: boolean = false;

  @Property()
  canUntrash: boolean = false;

  @Property()
  canUnshare: boolean = false;

  constructor(capabilities: Partial<Capabilities> = {}) {
    Object.assign(this, capabilities);
  }
}
