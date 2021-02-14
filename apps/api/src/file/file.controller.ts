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
  UseGuards
} from "@nestjs/common";

import { Request, Response } from "express";

import { plainToClass } from "class-transformer";

import { AuthGuard } from "../common/guards/auth.guard";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JSONHeader } from "../common/decorators/json-header.decorator";

import { ValidateCustomDecoratorPipe } from "../common/pipes/validate-custom-decorator.pipe";

import { FileService } from "./file.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "./file.entity";
import { UserEntity } from "../user/user.entity";

import { MoveFileDto } from "./dto/move-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { UploadFilesDto } from "./dto/upload-files.dto";
import { UploadResultsDto } from "./dto/upload-results.dto";

@Controller("files")
@UseGuards(AuthGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly uowService: UnitOfWorkService
  ) {}

  @Delete(":id")
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.uowService.withTransaction(() =>
      this.fileService.deleteOne({ id, user })
    );
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FileEntity> {
    return this.fileService.findOneOrFail({ id, user });
  }

  @Get("download/:id")
  async download(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string,
    @Res() response: Response
  ): Promise<void> {
    const readable = await this.fileService.createDownloadStream({ id, user });

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

  @Post("move/:id")
  move(
    @Body() dto: MoveFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ) {
    return this.fileService.move({ id, user }, { id: dto.to, user });
  }

  @Post("rename/:id")
  rename(
    @Body() dto: RenameFileDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ) {
    return this.fileService.rename({ id, user }, dto.newName);
  }

  @Post("upload")
  upload(
    @CurrentUser() user: UserEntity,
    @JSONHeader({ optional: true }, ValidateCustomDecoratorPipe) dto: UploadFilesDto, // prettier-ignore
    @Req() request: Request
  ): Promise<UploadResultsDto> {
    return this.uowService
      .withTransaction(() =>
        this.fileService.handleUpload(request, {
          parent: dto.parent,
          user
        })
      )
      .then((results) => plainToClass(UploadResultsDto, results));
  }
}
