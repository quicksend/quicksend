import { Controller, UseFilters } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import {
  CopyFilePattern,
  CreateFolderPattern,
  FileCapabilities,
  FindFilePattern,
  ListFolderContentsPattern,
  MoveFilePattern,
  RenameFilePattern,
  User,
  UserCreatedPattern,
  UserDeletedPattern
} from "@quicksend/types";

import { FilesExceptionFilter } from "./files.filter";
import { FilesService } from "./files.service";

import { File } from "./entities/file.entity";

import { CopyFilePayload } from "./payloads/copy-file.payload";
import { CreateFolderPayload } from "./payloads/create-folder.payload";
import { FindFilePayload } from "./payloads/find-file.payload";
import { MoveFilePayload } from "./payloads/move-file.payload";
import { RenameFilePayload } from "./payloads/rename-file.payload";

@Controller()
@UseFilters(FilesExceptionFilter)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @MessagePattern<CopyFilePattern>({
    cmd: "copy-file",
    service: "files"
  })
  copy(@Payload() payload: CopyFilePayload): Promise<File> {
    return this.filesService.copy(payload.from, payload.to);
  }

  @MessagePattern<CreateFolderPattern>({
    cmd: "create-folder",
    service: "files"
  })
  createFolder(@Payload() payload: CreateFolderPayload): Promise<File> {
    return this.filesService.createLeafFolder(payload.name, payload.parent);
  }

  @MessagePattern<FindFilePattern>({
    cmd: "find-file",
    service: "files"
  })
  findOne(@Payload() payload: FindFilePayload): Promise<File> {
    return this.filesService.findOne(payload.file);
  }

  @MessagePattern<ListFolderContentsPattern>({
    cmd: "list-folder-contents",
    service: "files"
  })
  list(@Payload() payload: any): Promise<File[]> {
    return this.filesService.list(payload.folder, payload.limit, payload.after);
  }

  @MessagePattern<MoveFilePattern>({
    cmd: "move-file",
    service: "files"
  })
  move(@Payload() payload: MoveFilePayload): Promise<File> {
    return this.filesService.move(payload.from, payload.to);
  }

  @MessagePattern<RenameFilePattern>({
    cmd: "rename-file",
    service: "files"
  })
  rename(@Payload() payload: RenameFilePayload): Promise<File> {
    return this.filesService.rename(payload.file, payload.newName);
  }

  @EventPattern<UserCreatedPattern>({
    event: "user-created",
    service: "users"
  })
  private async handleUserCreation(user: User): Promise<void> {
    const capabilities = [
      FileCapabilities.CAN_ADD_CHILDREN,
      FileCapabilities.CAN_LIST_CHILDREN,
      FileCapabilities.CAN_REMOVE_CHILDREN
    ];

    await Promise.all([
      this.filesService.createRootFolder("/", user.id, capabilities),
      this.filesService.createRootFolder("trash", user.id, capabilities)
    ]);
  }

  @EventPattern<UserDeletedPattern>({
    event: "user-deleted",
    service: "users"
  })
  private async handleUserDeletion(user: User): Promise<void> {
    await this.filesService.deleteMany({
      owner: user.id
    });
  }
}
