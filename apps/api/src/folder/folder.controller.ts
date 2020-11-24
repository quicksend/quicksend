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

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FolderService } from "./folder.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderNotFoundException } from "./folder.exceptions";

@Controller("folders")
@UseGuards(AuthGuard)
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private readonly uowService: UnitOfWorkService
  ) {}

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
    @Param("id") id: string
  ): Promise<FolderEntity> {
    const deleted = await this.uowService.withTransaction(() =>
      this.folderService.deleteOne({ id, user })
    );

    return deleted;
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    const folder = await this.folderService.findOne({ id, user });
    if (!folder) throw new FolderNotFoundException(id);

    return folder;
  }
}
