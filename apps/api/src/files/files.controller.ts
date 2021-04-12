import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseFilters,
  UseInterceptors
} from "@nestjs/common";

import { File } from "@quicksend/transmit";
import { Files, TransmitExceptionFilter, TransmitInterceptor } from "@quicksend/nestjs-transmit";

import { Response } from "express";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JSONHeader } from "../common/decorators/json-header.decorator";

import { TransactionalInterceptor } from "../common/interceptors/transactional.interceptor";

import { Maybe } from "../common/types/maybe.type";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { FilesService } from "./files.service";

import { User } from "../user/entities/user.entity";
import { VirtualFile } from "./entities/virtual-file.entity";
import { VirtualFileInvitation } from "./entities/virtual-file-invitation.entity";

import { CopyFileDto } from "./dto/copy-file.dto";
import { MoveFileDto } from "./dto/move-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { ShareFileDto } from "./dto/share-file.dto";
import { UploadFileDto } from "./dto/upload-file.dto";

import { FilesExceptionFilter } from "./files.filter";

@Controller("files")
@UseFilters(FilesExceptionFilter)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Auth({ optional: true, scopes: [ApplicationScopes.VIEW_FILES] })
  @Get(":id")
  find(@CurrentUser() user: Maybe<User>, @Param("id") id: string): Promise<VirtualFile> {
    return this.filesService.findOneOrFail({
      file: { id },
      user
    });
  }

  @Auth({ scopes: [ApplicationScopes.COPY_FILES] })
  @Post(":id/copy")
  copy(
    @Body() dto: CopyFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<VirtualFile> {
    return this.filesService.copy({
      destination: { id: dto.destination, user },
      source: { id },
      user
    });
  }

  @Auth({ scopes: [ApplicationScopes.DELETE_FILES] })
  @Delete(":id/delete")
  @UseInterceptors(TransactionalInterceptor)
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<VirtualFile> {
    return this.filesService.deletePermanently({ id, user });
  }

  @Auth({ optional: true, scopes: [ApplicationScopes.DOWNLOAD_FILES] })
  @Get(":id/download")
  async download(
    @CurrentUser() user: Maybe<User>,
    @Param("id") id: string,
    @Res() response: Response
  ): Promise<void> {
    const readable = await this.filesService.createReadableStream({
      file: { id },
      user
    });

    return new Promise((resolve, reject) => {
      readable.once("end", () => resolve());
      readable.once("error", (error) => reject(error));

      readable.pipe(response);
    });
  }

  @Auth({ scopes: [ApplicationScopes.MOVE_FILES] })
  @Patch(":id/move")
  move(
    @Body() dto: MoveFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<VirtualFile> {
    return this.filesService.move({
      destination: { id: dto.parent, user },
      source: { id, user }
    });
  }

  @Auth({ scopes: [ApplicationScopes.RENAME_FILES] })
  @Patch(":id/rename")
  rename(
    @Body() dto: RenameFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<VirtualFile> {
    return this.filesService.rename({
      file: { id },
      name: dto.name,
      user
    });
  }

  @Auth({ scopes: [ApplicationScopes.SHARE_FILES] })
  @Post(":id/share")
  @UseInterceptors(TransactionalInterceptor)
  share(
    @Body() dto: ShareFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<VirtualFileInvitation> {
    return this.filesService.share({
      expiresAt: dto.expiresAt,
      file: { id },
      invitee: dto.invitee && {
        id: dto.invitee
      },
      inviter: user,
      notifyInvitee: dto.notifyInvitee,
      privileges: dto.privileges
    });
  }

  @Auth({ scopes: [ApplicationScopes.UNSHARE_FILES] })
  @Delete("unshare/:invitation")
  unshare(
    @CurrentUser() user: User,
    @Param("invitation") invitation: string
  ): Promise<VirtualFileInvitation> {
    return this.filesService.unshare({
      invitation: { id: invitation },
      user
    });
  }

  @Auth({ scopes: [ApplicationScopes.UPLOAD_FILES] })
  @Post("upload")
  @UseFilters(TransmitExceptionFilter)
  @UseInterceptors(TransactionalInterceptor, TransmitInterceptor())
  upload(
    @CurrentUser() user: User,
    @Files() files: File[], // guaranteed to have at least 1 file
    @JSONHeader() dto: UploadFileDto
  ): Promise<VirtualFile> {
    return this.filesService.save({
      folder: { id: dto.destination, user },
      metadata: files[0],
      sharing: dto.sharing && {
        ...dto.sharing,
        invitee: dto.sharing.invitee && {
          id: dto.sharing.invitee
        }
      }
    });
  }
}
