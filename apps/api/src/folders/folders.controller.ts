import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UseApplicationScopes } from "../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { ApplicationScopesEnum } from "../applications/enums/application-scopes.enum";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FoldersService } from "./folders.service";

import { FoldersExceptionFilter } from "./folders.filter";

import { CreateFolderDto } from "./dto/create-folder.dto";
import { MoveFolderDto } from "./dto/move-folder.dto";
import { RenameFolderDto } from "./dto/rename-folder.dto";

@Controller("folders")
@UseFilters(FoldersExceptionFilter)
@UseGuards(AuthGuard)
export class FolderController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  create(
    @Body() dto: CreateFolderDto,
    @CurrentUser() user: UserEntity
  ): Promise<FolderEntity> {
    return this.foldersService.create(dto.name, dto.parent, user);
  }

  @Get(":id?")
  @UseApplicationScopes(ApplicationScopesEnum.READ_FOLDER_METADATA)
  find(
    @CurrentUser() user: UserEntity,
    @Param("id") id?: string
  ): Promise<FolderEntity> {
    return id
      ? this.foldersService.findOneOrFail({ id, user })
      : this.foldersService.findOneOrFail({ parent: null, user });
  }

  @Delete(":id/delete")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.foldersService.deleteOne({ id, user });
  }

  @Patch(":id/move")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  move(
    @Body() dto: MoveFolderDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.foldersService.move({ id, user }, { id: dto.parent, user });
  }

  @Patch(":id/rename")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  rename(
    @Body() dto: RenameFolderDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.foldersService.rename({ id, user }, dto.name);
  }
}
