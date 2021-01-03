import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";

import { CreateFolderDto } from "./dto/create-folder.dto";

import { AuthGuard } from "../common/guards/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ParseUUIDV4Pipe } from "../common/pipes/parse-uuid-v4.pipe";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FolderService } from "./folder.service";

import { FolderNotFoundException } from "./folder.exceptions";

@Controller("folders")
@UseGuards(AuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  create(
    @Body() dto: CreateFolderDto,
    @CurrentUser() user: UserEntity
  ): Promise<FolderEntity> {
    return this.folderService.create({
      ...dto,
      user
    });
  }

  @Delete(":id")
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id", ParseUUIDV4Pipe) id: string
  ): Promise<FolderEntity> {
    return this.folderService.deleteOne({ id, user });
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id", ParseUUIDV4Pipe) id: string
  ): Promise<FolderEntity> {
    const folder = await this.folderService.findOne({ id, user });
    if (!folder) throw new FolderNotFoundException(id);

    return folder;
  }
}
