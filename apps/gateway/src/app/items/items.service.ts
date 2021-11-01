import { Inject, Injectable } from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Observable } from "rxjs";

import { NATS_CLIENT } from "../app.constants";

import { CopyItemPayload } from "./payloads/copy-item.payload";
import { CreateFolderPayload } from "./payloads/create-folder.payload";
import { CreateInvitationPayload } from "./payloads/create-invitation.payload";
import { DeleteItemPayload } from "./payloads/delete-item.payload";
import { FindInvitationPayload } from "./payloads/find-invitation.payload";
import { FindItemPayload } from "./payloads/find-item.payload";
import { ListItemVersionsPayload } from "./payloads/list-item-versions.payload";
import { LockItemPayload } from "./payloads/lock-item.payload";
import { MoveItemPayload } from "./payloads/move-item.payload";
import { RenameItemPayload } from "./payloads/rename-item.payload";
import { RescindInvitationPayload } from "./payloads/rescind-invitation.payload";
import { RestoreItemPayload } from "./payloads/restore-item.payload";
import { TransferItemPayload } from "./payloads/transfer-item.payload";
import { TrashItemPayload } from "./payloads/trash-item.payload";
import { UnlockItemPayload } from "./payloads/unlock-item.payload";
import { UnshareItemPayload } from "./payloads/unshare-item.payload";
import { UntrashItemPayload } from "./payloads/untrash-item.payload";

import { AsyncJob } from "./resources/async-job.resource";
import { Invitation } from "./resources/invitation.resource";
import { Item } from "./resources/item.resource";
import { Version } from "./resources/version.resource";

@Injectable()
export class ItemsService {
  constructor(@Inject(NATS_CLIENT) private readonly client: NatsClient) {}

  copyItem(payload: CopyItemPayload): Observable<AsyncJob> {
    return this.client.send("items.item.copy", payload);
  }

  createFolder(payload: CreateFolderPayload): Observable<Item> {
    return this.client.send("items.item.create-folder", payload);
  }

  createInvitation(payload: CreateInvitationPayload): Observable<Invitation> {
    return this.client.send("items.invitation.create", payload);
  }

  deleteItem(payload: DeleteItemPayload): Observable<Item> {
    return this.client.send("items.item.delete", payload);
  }

  findInvitation(payload: FindInvitationPayload): Observable<Invitation> {
    return this.client.send("items.invitation.find", payload);
  }

  findItem(payload: FindItemPayload): Observable<Item> {
    return this.client.send("items.item.find", payload);
  }

  listVersions(payload: ListItemVersionsPayload): Observable<Version[]> {
    return this.client.send("items.item.versions", payload);
  }

  lockItem(payload: LockItemPayload): Observable<Item> {
    return this.client.send("items.item.lock", payload);
  }

  moveItem(payload: MoveItemPayload): Observable<Item> {
    return this.client.send("items.item.move", payload);
  }

  renameItem(payload: RenameItemPayload): Observable<Item> {
    return this.client.send("items.item.rename", payload);
  }

  rescindInvitation(payload: RescindInvitationPayload): Observable<Invitation> {
    return this.client.send("items.invitation.rescind", payload);
  }

  restoreItem(payload: RestoreItemPayload): Observable<Item> {
    return this.client.send("items.item.restore", payload);
  }

  transferItem(payload: TransferItemPayload): Observable<Item> {
    return this.client.send("items.item.transfer", payload);
  }

  trashItem(payload: TrashItemPayload): Observable<Item> {
    return this.client.send("items.item.trash", payload);
  }

  unlockItem(payload: UnlockItemPayload): Observable<Item> {
    return this.client.send("items.item.unlock", payload);
  }

  unshareItem(payload: UnshareItemPayload): Observable<Item> {
    return this.client.send("items.item.unshare", payload);
  }

  untrashItem(payload: UntrashItemPayload): Observable<Item> {
    return this.client.send("items.item.untrash", payload);
  }
}
