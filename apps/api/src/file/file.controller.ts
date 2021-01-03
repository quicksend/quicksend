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

import { CustomDecoratorValidator } from "../common/pipes/custom-decorator-validator.pipe";
import { ParseUUIDV4Pipe } from "../common/pipes/parse-uuid-v4.pipe";

import { FileService } from "./file.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "./file.entity";
import { UserEntity } from "../user/user.entity";

import { UploadFilesDto } from "./dto/upload-files.dto";
import { UploadResultsDto } from "./dto/upload-results.dto";

import { FileNotFoundException } from "./file.exceptions";

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
    @Param("id", ParseUUIDV4Pipe) id: string
  ): Promise<FileEntity> {
    return this.uowService.withTransaction(() =>
      this.fileService.deleteOne({ id, user })
    );
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id", ParseUUIDV4Pipe) id: string
  ): Promise<FileEntity> {
    const file = await this.fileService.findOne({ id, user });
    if (!file) throw new FileNotFoundException();

    return file;
  }

  @Get("download/:id")
  async download(
    @CurrentUser() user: UserEntity,
    @Param("id", ParseUUIDV4Pipe) id: string,
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

  @Post("upload")
  async upload(
    @CurrentUser() user: UserEntity,
    @JSONHeader({ optional: true }, CustomDecoratorValidator) dto: UploadFilesDto, // prettier-ignore
    @Req() request: Request
  ): Promise<UploadResultsDto> {
    const results = await this.uowService.withTransaction(() =>
      this.fileService.handleUpload(request, {
        parent: dto.parent,
        user
      })
    );

    return {
      failed: results.failed.map(({ error, file }) => ({
        error: error.message,
        file
      })),

      succeeded: results.succeeded.map((file) => plainToClass(FileEntity, file))
    };
  }
}
