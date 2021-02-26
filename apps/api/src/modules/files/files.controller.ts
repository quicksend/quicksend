import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { Request, Response } from "express";

import { plainToClass } from "class-transformer";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JSONHeader } from "../../common/decorators/json-header.decorator";
import { UseApplicationScopes } from "../../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../../common/guards/auth.guard";

import { ValidateCustomDecoratorPipe } from "../../common/pipes/validate-custom-decorator.pipe";

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
import { UploadFilesDto } from "./dto/upload-files.dto";
import { UploadResultsDto } from "./dto/upload-results.dto";

@Controller("files")
@UseFilters(FilesExceptionFilter, FoldersExceptionFilter)
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
      this.filesService.copy({ id, user }, { id: dto.to, user })
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
    const readable = await this.filesService.createDownloadStream({ id, user });

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

  @Post(":id/move")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  move(
    @Body() dto: MoveFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ) {
    return this.filesService.move({ id, user }, { id: dto.to, user });
  }

  @Post(":id/rename")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_METADATA)
  rename(
    @Body() dto: RenameFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ) {
    return this.filesService.rename({ id, user }, dto.newName);
  }

  @Post("upload")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FILE_CONTENTS)
  upload(
    @CurrentUser() user: UserEntity,
    @JSONHeader({ optional: true }, ValidateCustomDecoratorPipe) dto: UploadFilesDto, // prettier-ignore
    @Req() request: Request
  ): Promise<UploadResultsDto> {
    return this.uowService
      .withTransaction(() =>
        this.filesService.handleUpload(request, {
          parent: dto.parent,
          user
        })
      )
      .then((results) => plainToClass(UploadResultsDto, results));
  }
}
