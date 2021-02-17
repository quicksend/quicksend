import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FoldersService } from "./folders.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { CreateFolderDto } from "./dto/create-folder.dto";
import { MoveFolderDto } from "./dto/move-folder.dto";

@Controller("folders")
@UseGuards(AuthGuard)
export class FolderController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly uowService: UnitOfWorkService
  ) {}

  @Post()
  async create(
    @Body() dto: CreateFolderDto,
    @CurrentUser() user: UserEntity
  ): Promise<FolderEntity> {
    return this.uowService.withTransaction(() =>
      this.foldersService.create({
        ...dto,
        user
      })
    );
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.foldersService.findOneOrFail({ id, user });
  }

  @Delete(":id/delete")
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.uowService.withTransaction(() =>
      this.foldersService.deleteOne({ id, user })
    );
  }

  @Patch(":id/move")
  async move(
    @Body() dto: MoveFolderDto,
    @CurrentUser() user: UserEntity
  ): Promise<FolderEntity> {
    return this.uowService.withTransaction(() =>
      this.foldersService.move({ id: dto.from, user }, { id: dto.to, user })
    );
  }

  @Get("root")
  async root(@CurrentUser() user: UserEntity): Promise<FolderEntity> {
    return this.foldersService.findOneOrFail({ parent: null, user });
  }
}
