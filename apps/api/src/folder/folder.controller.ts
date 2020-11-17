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

import { FolderEntity } from "./entities/folder.entity";
import { UserEntity } from "../user/entities/user.entity";

import { FolderService } from "./folder.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderNotFound } from "./folder.exception";

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
  async deleteOne(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    const deleted = await this.uowService.withTransaction(() =>
      this.folderService.deleteOne({ id, user })
    );

    return deleted;
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    const folder = await this.folderService.findOne({ id, user });
    if (!folder) throw new FolderNotFound(id);

    return folder;
  }
}
