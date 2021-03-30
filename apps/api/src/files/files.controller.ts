import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";

import { File } from "@quicksend/transmit";

import {
  Files,
  TransmitExceptionFilter,
  TransmitInterceptor
} from "@quicksend/nestjs-transmit";

import { Response } from "express";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JSONHeader } from "../common/decorators/json-header.decorator";
import { OptionalAuth } from "../common/decorators/optional-auth.decorator";
import { UseApplicationScopes } from "../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { ValidationPipe } from "../common/pipes/validation.pipe";

import { ApplicationScopesEnum } from "../applications/enums/application-scopes.enum";

import { FilesService } from "./files.service";

import { FileEntity } from "./file.entity";
import { FileInvitationEntity } from "./entities/file-invitation.entity";
import { UserEntity } from "../user/user.entity";

import { CopyFileDto } from "./dto/copy-file.dto";
import { MoveFileDto } from "./dto/move-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { ShareFileDto } from "./dto/share-file.dto";
import { UploadFileDto } from "./dto/upload-file.dto";

import { FilesExceptionFilter } from "./files.filter";

@Controller("files")
@UseFilters(FilesExceptionFilter)
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(":id")
  @OptionalAuth()
  @UseApplicationScopes(ApplicationScopesEnum.READ_FILE_METADATA)
  find(
    @CurrentUser() user: UserEntity | null,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.findOneOrFail({ id }, user);
  }

  @Post(":id/copy")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  copy(
    @Body() dto: CopyFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.copy({ id, user }, { id: dto.destination, user });
  }

  @Delete(":id/delete")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.deleteOne({ id, user });
  }

  @Get(":id/download")
  @OptionalAuth()
  @UseApplicationScopes(ApplicationScopesEnum.READ_FILE_CONTENTS)
  async download(
    @CurrentUser() user: UserEntity | null,
    @Param("id") id: string,
    @Res() response: Response
  ): Promise<void> {
    const readable = await this.filesService.createReadableStream({ id }, user);

    readable.on("error", (error) => {
      Logger.error(error);

      if (!response.headersSent) {
        const err = new InternalServerErrorException(error);

        response.status(err.getStatus());
        response.send(err.getResponse());
      }
    });

    readable.pipe(response);
  }

  @Patch(":id/move")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  move(
    @Body() dto: MoveFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.move({ id, user }, { id: dto.parent, user });
  }

  @Patch(":id/rename")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  rename(
    @Body() dto: RenameFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.rename({ id, user }, dto.name);
  }

  @Post(":id/share")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  share(
    @Body() dto: ShareFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileInvitationEntity> {
    return this.filesService.share(
      { id, user },
      dto.invitee ? { id: dto.invitee } : null,
      dto.privilege,
      dto.expiresAt
    );
  }

  @Delete(":id/unshare/:invitation")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  unshare(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string,
    @Param("invitation") invitation: string
  ): Promise<FileInvitationEntity> {
    return this.filesService.unshare({ id, user }, { id: invitation });
  }

  @Post("upload")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_CONTENTS)
  @UseFilters(TransmitExceptionFilter)
  @UseInterceptors(TransmitInterceptor())
  upload(
    @CurrentUser() user: UserEntity,
    @Files() files: File[], // guaranteed to have at least 1 file
    @JSONHeader(ValidationPipe({ validateCustomDecorators: true })) dto: UploadFileDto // prettier-ignore
  ): Promise<FileEntity> {
    return this.filesService.save(files[0], dto.isPublic, {
      id: dto.destination,
      user
    });
  }
}
