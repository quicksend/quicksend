import { Body, Controller, Get, Param, Patch, Post, Res, UseFilters } from "@nestjs/common";

import { File as FileMetadata } from "@quicksend/transmit";
import { Files } from "@quicksend/nestjs-transmit";

import { Response } from "express";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { HandleUploads } from "../common/decorators/handle-uploads.decorator";
import { JSONHeader } from "../common/decorators/json-header.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";
import { ValidateBody } from "../common/decorators/validate-body.decorator";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";
import { Privileges } from "../sharing/enums/privileges.enum";

import { FilesExceptionFilter } from "./files.filter";
import { SharingExceptionFilter } from "../sharing/sharing.filter";

import { FilesService } from "./files.service";

import { File } from "./entities/file.entity";
import { User } from "../user/entities/user.entity";

import { CopyFileDto } from "./dtos/copy-file.dto";
import { CreateFolderDto } from "./dtos/create-folder.dto";
import { MoveFileDto } from "./dtos/move-file.dto";
import { RenameFileDto } from "./dtos/rename-file.dto";
import { UploadFileDto } from "./dtos/upload-file.dto";

import { FileByIdPipe } from "./pipes/file-by-id.pipe";

@Controller("files")
@UseFilters(FilesExceptionFilter, SharingExceptionFilter)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @Post("create-folder")
  @Transactional()
  @ValidateBody(CreateFolderDto)
  createFolder(
    @Body("name") name: string,
    @Body("parent", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) destination: File
  ): Promise<File> {
    return this.filesService.createFolder(name, destination);
  }

  @Auth({ scopes: [ApplicationScopes.READ_FILE_METADATA] })
  @Get("cabinet")
  findFileCabinet(@CurrentUser() user: User): Promise<File> {
    return this.filesService.findFileCabinet(user);
  }

  @Auth({ scopes: [ApplicationScopes.READ_FILE_METADATA] })
  @Get("trash")
  findTrashBin(@CurrentUser() user: User): Promise<File> {
    return this.filesService.findTrashBin(user);
  }

  @Auth({ optional: true, scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @HandleUploads({ maxFiles: 1, minFiles: 1 })
  @JSONHeader(UploadFileDto)
  @Post("upload")
  @Transactional()
  upload(
    @Files() files: FileMetadata[],
    @Body("parent", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) destination: File
  ): Promise<File> {
    return this.filesService.save(files[0], destination);
  }

  @Auth({ optional: true, scopes: [ApplicationScopes.READ_FILE_METADATA] })
  @Get(":id")
  findOne(@Param("id", FileByIdPipe(Privileges.READ_FILE_METADATA)) file: File): File {
    return file;
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @Post(":id/copy")
  @Transactional()
  @ValidateBody(CopyFileDto)
  copy(
    @Param("id", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) source: File,
    @Body("parent", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) destination: File
  ): Promise<File> {
    return this.filesService.copy(source, destination);
  }

  @Auth({ optional: true, scopes: [ApplicationScopes.READ_FILE_CONTENT] })
  @Get(":id/download")
  async download(
    @Param("id", FileByIdPipe(Privileges.READ_FILE_CONTENT)) file: File,
    @Res() response: Response
  ): Promise<void> {
    const readable = await this.filesService.stream(file);

    return new Promise((resolve, reject) => {
      readable.once("end", () => resolve());
      readable.once("error", (error) => reject(error));

      readable.pipe(response);
    });
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @Patch(":id/move")
  @Transactional()
  @ValidateBody(MoveFileDto)
  move(
    @Param("id", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) source: File,
    @Body("parent", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) destination: File
  ): Promise<File> {
    return this.filesService.move(source, destination);
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @Patch(":id/rename")
  @Transactional()
  @ValidateBody(RenameFileDto)
  rename(
    @Param("id", FileByIdPipe(Privileges.WRITE_FILE_CONTENT)) file: File,
    @Body("name") newName: string
  ): Promise<File> {
    return this.filesService.rename(file, newName);
  }
}
