import { ApiTags } from "@nestjs/swagger";

import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { Observable } from "rxjs";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { ItemsService } from "./items.service";

import { CopyItemDto } from "./dtos/copy-item.dto";
import { CreateFolderDto } from "./dtos/create-folder.dto";
import { CreateInvitationDto } from "./dtos/create-invitation.dto";
import { LockItemDto } from "./dtos/lock-item.dto";
import { MoveItemDto } from "./dtos/move-item.dto";
import { RenameItemDto } from "./dtos/rename-item.dto";
import { TransferItemDto } from "./dtos/transfer-item.dto";

import { AsyncJob } from "./resources/async-job.resource";
import { Invitation } from "./resources/invitation.resource";
import { Item } from "./resources/item.resource";
import { Version } from "./resources/version.resource";

@ApiTags("Items")
@Auth()
@Controller({
  path: "items",
  version: "1"
})
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Delete(":item_id")
  deleteItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.deleteItem({
      deletedBy: user,
      item: itemId
    });
  }

  @Get(":item_id")
  findItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.findItem({
      id: itemId,
      user
    });
  }

  @Post(":item_id/copy")
  copyItem(
    @Body() dto: CopyItemDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<AsyncJob> {
    return this.itemsService.copyItem({
      copiedBy: user,
      destination: dto.parent,
      name: dto.name,
      source: itemId
    });
  }

  @Post(":item_id/folders")
  createFolder(
    @Body() dto: CreateFolderDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Item> {
    return this.itemsService.createFolder({
      createdBy: user,
      expiresAt: dto.expiresAt,
      name: dto.name,
      parent: itemId
    });
  }

  @Delete(":item_id/invitations")
  unshareItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.unshareItem({
      item: itemId,
      unsharedBy: user
    });
  }

  @Get(":item_id/invitations/:invitation_id")
  findInvitation(
    @CurrentUser() user: string,
    @Param("invitation_id") invitationId: string,
    @Param("item_id") itemId: string
  ): Observable<Invitation> {
    return this.itemsService.findInvitation({
      invitation: invitationId,
      item: itemId,
      user
    });
  }

  @Delete(":item_id/invitations/:invitation_id")
  rescindInvitation(
    @CurrentUser() user: string,
    @Param("invitation_id") invitationId: string,
    @Param("item_id") itemId: string
  ): Observable<Invitation> {
    return this.itemsService.rescindInvitation({
      invitation: invitationId,
      item: itemId,
      rescindedBy: user
    });
  }

  @Post(":item_id/lock")
  lockItem(
    @Body() dto: LockItemDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Item> {
    return this.itemsService.lockItem({
      expiresAt: dto.expiresAt,
      item: itemId,
      lockedBy: user,
      reason: dto.reason
    });
  }

  @Patch(":item_id/move")
  moveItem(
    @Body() dto: MoveItemDto,
    @CurrentUser() user: string,
    @Param("item-id") itemId: string
  ): Observable<Item> {
    return this.itemsService.moveItem({
      destination: dto.parent,
      movedBy: user,
      source: itemId
    });
  }

  @Patch(":item_id/rename")
  renameItem(
    @Body() dto: RenameItemDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Item> {
    return this.itemsService.renameItem({
      item: itemId,
      newName: dto.name,
      renamedBy: user
    });
  }

  @Post(":item_id/share")
  createInvitation(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Invitation> {
    return this.itemsService.createInvitation({
      expiresAt: dto.expiresAt,
      invitee: dto.invitee,
      inviter: user,
      item: itemId,
      message: dto.message,
      notifyInvitee: dto.notifyInvitee,
      role: dto.role
    });
  }

  @Post(":item_id/transfer")
  transferItem(
    @Body() dto: TransferItemDto,
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Item> {
    return this.itemsService.transferItem({
      item: itemId,
      newOwner: dto.newOwner,
      transferredBy: user
    });
  }

  @Patch(":item_id/trash")
  trashItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.trashItem({
      item: itemId,
      trashedBy: user
    });
  }

  @Delete(":item_id/unlock")
  unlockItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.unlockItem({
      item: itemId,
      unlockedBy: user
    });
  }

  @Patch(":item_id/untrash")
  untrashItem(@CurrentUser() user: string, @Param("item_id") itemId: string): Observable<Item> {
    return this.itemsService.untrashItem({
      item: itemId,
      untrashedBy: user
    });
  }

  @Get(":item_id/versions")
  listVersions(
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Observable<Version[]> {
    return this.itemsService.listVersions({
      item: itemId,
      user
    });
  }

  @Post(":item_id/versions/:version_id")
  restoreItem(
    @CurrentUser() user: string,
    @Param("item_id") itemId: string,
    @Param("version_id") versionId: string
  ): Observable<Item> {
    return this.itemsService.restoreItem({
      item: itemId,
      restoreTo: versionId,
      restoredBy: user
    });
  }
}
