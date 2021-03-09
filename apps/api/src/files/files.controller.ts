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
} from "@quicksend/nest-transmit";

import { Response } from "express";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JSONHeader } from "../common/decorators/json-header.decorator";
import { UseApplicationScopes } from "../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { ValidationPipe } from "../common/pipes/validation.pipe";

import { ApplicationScopesEnum } from "../applications/enums/application-scopes.enum";

import { FilesService } from "./files.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FilesExceptionFilter } from "./files.filter";
import { FoldersExceptionFilter } from "../folders/folders.filter";

import { FileEntity } from "./file.entity";
import { UserEntity } from "../user/user.entity";

import { CopyFileDto } from "./dto/copy-file.dto";
import { MoveFileDto } from "./dto/move-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { UploadFileDto } from "./dto/upload-file.dto";

@Controller("files")
@UseFilters(
  FilesExceptionFilter,
  FoldersExceptionFilter,
  TransmitExceptionFilter
)
@UseGuards(AuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly uowService: UnitOfWorkService
  ) {}

  @Get(":id")
  @UseApplicationScopes(ApplicationScopesEnum.READ_FILE_METADATA)
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.findOneOrFail({ id, user });
  }

  @Post(":id/copy")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  async copy(
    @Body() dto: CopyFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.uowService.withTransaction(() =>
      this.filesService.copy({ id, user }, { id: dto.destination, user })
    );
  }

  @Delete(":id/delete")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.uowService.withTransaction(() =>
      this.filesService.deleteOne({ id, user })
    );
  }

  @Get(":id/download")
  @UseApplicationScopes(ApplicationScopesEnum.READ_FILE_CONTENTS)
  async download(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string,
    @Res() response: Response
  ): Promise<void> {
    const readable = await this.filesService.createReadableStream({ id, user });

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
  async move(
    @Body() dto: MoveFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.move({ id, user }, { id: dto.parent, user });
  }

  @Patch(":id/rename")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  async rename(
    @Body() dto: RenameFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.filesService.rename({ id, user }, dto.name);
  }

  @Post("upload")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_CONTENTS)
  @UseInterceptors(TransmitInterceptor())
  async upload(
    @CurrentUser() user: UserEntity,
    @Files() files: File[], // guaranteed to have at least 1 file
    @JSONHeader(ValidationPipe({ validateCustomDecorators: true })) dto: UploadFileDto // prettier-ignore
  ): Promise<FileEntity> {
    return this.uowService.withTransaction(() =>
      this.filesService.save(files[0], {
        id: dto.destination,
        user
      })
    );
  }
}
