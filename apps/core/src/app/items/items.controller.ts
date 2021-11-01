import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UseFilters,
  UseInterceptors
} from "@nestjs/common";

import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import { File } from "@quicksend/transmit";
import { Files, TransmitExceptionFilter, TransmitInterceptor } from "@quicksend/nestjs-transmit";

import { JSONHeader } from "@quicksend/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";

import { ItemsService } from "./items.service";

import { UploadFileDto } from "./dtos/upload-file.dto";

import { Invitation } from "./entities/invitation.entity";
import { Item } from "./entities/item.entity";
import { Version } from "./entities/version.entity";

import { InvitationRole } from "./enums/invitation-role.enum";

import { AsyncJob } from "./interfaces/async-job.interface";
import { AsyncJobStatus } from "./interfaces/async-job-status.interface";

import { CreateInvitationPayload } from "./payloads/create-invitation.payload";
import { RescindInvitationPayload } from "./payloads/rescind-invitation.payload";

import { CopyItemPayload } from "./payloads/copy-item.payload";
import { CreateFolderPayload } from "./payloads/create-folder.payload";
import { DeleteItemPayload } from "./payloads/delete-item.payload";
import { FindInvitationPayload } from "./payloads/find-invitation.payload";
import { FindItemPayload } from "./payloads/find-item.payload";
import { ListItemVersionsPayload } from "./payloads/list-item-versions.payload";
import { LockItemPayload } from "./payloads/lock-item.payload";
import { MoveItemPayload } from "./payloads/move-item.payload";
import { RenameItemPayload } from "./payloads/rename-item.payload";
import { RestoreItemPayload } from "./payloads/restore-item.payload";
import { TransferItemPayload } from "./payloads/transfer-item.payload";
import { TrashItemPayload } from "./payloads/trash-item.payload";
import { UnlockItemPayload } from "./payloads/unlock-item.payload";
import { UnshareItemPayload } from "./payloads/unshare-item.payload";
import { UntrashItemPayload } from "./payloads/untrash-item.payload";

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Auth()
  @Get("download/:item_id")
  downloadFile(
    @CurrentUser() user: string,
    @Param("item_id") itemId: string
  ): Promise<StreamableFile> {
    return this.itemsService
      .readFile(itemId, {
        user
      })
      .then((readable) => new StreamableFile(readable));
  }

  @Get("monitor/:job_id")
  monitorAsyncJob(@Param("job_id") jobId: string): Promise<AsyncJobStatus> {
    return this.itemsService.monitorAsyncJob(jobId);
  }

  @Auth()
  @JSONHeader(UploadFileDto)
  @Post("upload")
  @UseFilters(TransmitExceptionFilter)
  @UseInterceptors(TransmitInterceptor())
  uploadFile(
    @Body() dto: UploadFileDto,
    @CurrentUser() user: string,
    @Files() [file]: File[]
  ): Promise<Item> {
    return this.itemsService.createFile(file, {
      capabilities: {
        canCopy: true,
        canDelete: true,
        canDownload: true,
        canLock: true,
        canMove: true,
        canRename: true,
        canRestore: true,
        canShare: true,
        canTransfer: true,
        canTrash: true,
        canUnshare: true,
        canUntrash: true
      },
      name: dto.name,
      parent: dto.parent,
      uploadedBy: user
    });
  }

  @MessagePattern("items.item.copy")
  @Transactional()
  copyItem(@Payload() payload: CopyItemPayload): Promise<AsyncJob> {
    return this.itemsService.copyItem(payload.source, payload.destination, {
      copiedBy: payload.copiedBy,
      name: payload.name
    });
  }

  @MessagePattern("items.item.create-folder")
  @Transactional()
  createFolder(@Payload() payload: CreateFolderPayload): Promise<Item> {
    return this.itemsService.createFolder({
      capabilities: {
        canAddChildren: true,
        canCopy: true,
        canDelete: true,
        canDeleteChildren: true,
        canListChildren: true,
        canLock: true,
        canMove: true,
        canRename: true,
        canRestore: true,
        canShare: true,
        canTransfer: true,
        canTrash: true,
        canTrashChildren: true,
        canUnshare: true,
        canUntrash: true
      },
      createdBy: payload.createdBy,
      expiresAt: payload.expiresAt,
      name: payload.name,
      parent: payload.parent
    });
  }

  @MessagePattern("items.invitation.create")
  @Transactional()
  createInvitation(@Payload() payload: CreateInvitationPayload): Promise<Invitation> {
    return this.itemsService.createInvitation(payload.item, {
      expiresAt: payload.expiresAt,
      invitee: payload.invitee,
      inviter: payload.inviter,
      message: payload.message,
      notifyInvitee: payload.notifyInvitee,
      role: payload.role
    });
  }

  @MessagePattern("items.item.delete")
  @Transactional()
  deleteItem(@Payload() payload: DeleteItemPayload): Promise<Item> {
    return this.itemsService.deleteItem(payload.item, {
      deletedBy: payload.deletedBy
    });
  }

  @MessagePattern("items.invitation.find")
  findInvitation(@Payload() payload: FindInvitationPayload): Promise<Invitation> {
    return this.itemsService.findInvitation(payload.item, {
      invitation: payload.invitation,
      user: payload.user
    });
  }

  @MessagePattern("items.item.find")
  findItem(@Payload() payload: FindItemPayload): Promise<Item> {
    return this.itemsService.findItem(payload.id, {
      role: InvitationRole.READER,
      user: payload.user
    });
  }

  @MessagePattern("items.item.list-versions")
  listVersions(@Payload() payload: ListItemVersionsPayload): Promise<Version[]> {
    return this.itemsService.listVersions(payload.item, {
      user: payload.user
    });
  }

  @MessagePattern("items.item.lock")
  @Transactional()
  lockItem(@Payload() payload: LockItemPayload): Promise<Item> {
    return this.itemsService.lockItem(payload.item, {
      expiresAt: payload.expiresAt,
      lockedBy: payload.lockedBy,
      reason: payload.reason
    });
  }

  @MessagePattern("items.item.move")
  @Transactional()
  moveItem(@Payload() payload: MoveItemPayload): Promise<Item> {
    return this.itemsService.moveItem(payload.source, payload.destination, {
      movedBy: payload.movedBy
    });
  }

  @MessagePattern("items.item.rename")
  @Transactional()
  renameItem(@Payload() payload: RenameItemPayload): Promise<Item> {
    return this.itemsService.renameItem(payload.item, {
      newName: payload.newName,
      renamedBy: payload.renamedBy
    });
  }

  @MessagePattern("items.invitation.rescind")
  @Transactional()
  rescindInvitation(@Payload() payload: RescindInvitationPayload): Promise<Invitation> {
    return this.itemsService.rescindInvitation(payload.item, {
      invitation: payload.invitation,
      rescindedBy: payload.rescindedBy
    });
  }

  @MessagePattern("items.item.restore")
  @Transactional()
  restoreItem(@Payload() payload: RestoreItemPayload): Promise<Item> {
    return this.itemsService.restoreItem(payload.item, {
      restoreTo: payload.restoreTo,
      restoredBy: payload.restoredBy
    });
  }

  @MessagePattern("items.item.transfer")
  @Transactional()
  transferItem(@Payload() payload: TransferItemPayload): Promise<Item> {
    return this.itemsService.transferItem(payload.item, {
      newOwner: payload.newOwner,
      transferredBy: payload.transferredBy
    });
  }

  @MessagePattern("items.item.trash")
  @Transactional()
  trashItem(@Payload() payload: TrashItemPayload): Promise<Item> {
    return this.itemsService.trashItem(payload.item, {
      autoDeleteOn: payload.autoDeleteOn,
      trashedBy: payload.trashedBy
    });
  }

  @MessagePattern("items.item.unlock")
  @Transactional()
  unlockItem(@Payload() payload: UnlockItemPayload): Promise<Item> {
    return this.itemsService.unlockItem(payload.item, {
      unlockedBy: payload.unlockedBy
    });
  }

  @MessagePattern("items.item.unshare")
  @Transactional()
  unshareItem(@Payload() payload: UnshareItemPayload): Promise<Item> {
    return this.itemsService.unshareItem(payload.item, {
      unsharedBy: payload.unsharedBy
    });
  }

  @MessagePattern("items.item.untrash")
  @Transactional()
  untrashItem(@Payload() payload: UntrashItemPayload): Promise<Item> {
    return this.itemsService.untrashItem(payload.item, {
      untrashedBy: payload.untrashedBy
    });
  }

  @EventPattern("auth.user.created")
  @Transactional()
  handleUserCreated(event: any): Promise<unknown> {
    return this.itemsService.createRootFolder({
      capabilities: {
        canAddChildren: true,
        canDeleteChildren: true,
        canListChildren: true,
        canTrashChildren: true
      },
      createdBy: event.created.id,
      name: event.created.username
    });
  }

  @EventPattern("auth.user.deleted")
  @Transactional()
  handleUserDeleted(event: any): Promise<unknown> {
    return this.itemsService.deleteItem(
      {
        owner: event.deleted.id,
        parent: null
      },
      {
        deletedBy: event.deleted.id
      }
    );
  }
}
