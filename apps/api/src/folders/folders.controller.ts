import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseInterceptors
} from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { TransactionalInterceptor } from "../common/interceptors/transactional.interceptor";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { FoldersService } from "./folders.service";

import { Folder } from "./entities/folder.entity";
import { User } from "../user/entities/user.entity";

import { CreateFolderDto } from "./dto/create-folder.dto";
import { MoveFolderDto } from "./dto/move-folder.dto";
import { RenameFolderDto } from "./dto/rename-folder.dto";

import { FoldersExceptionFilter } from "./folders.filter";

@Controller("folders")
@UseFilters(FoldersExceptionFilter)
export class FolderController {
  constructor(private readonly foldersService: FoldersService) {}

  @Auth({ scopes: [ApplicationScopes.CREATE_FOLDERS] })
  @Post()
  @UseInterceptors(TransactionalInterceptor)
  create(@Body() dto: CreateFolderDto, @CurrentUser() user: User): Promise<Folder> {
    return this.foldersService.create({
      name: dto.name,
      parent: { id: dto.parent },
      user
    });
  }

  @Auth({ scopes: [ApplicationScopes.BROWSE_FOLDERS] })
  @Get(":id?")
  find(@CurrentUser() user: User, @Param("id") id?: string): Promise<Folder> {
    return id
      ? this.foldersService.findOneOrFail({ id, user })
      : this.foldersService.findOneOrFail({ parent: null, user });
  }

  @Auth({ scopes: [ApplicationScopes.DELETE_FOLDERS] })
  @Delete(":id/delete")
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<Folder> {
    return this.foldersService.deleteOne({
      folder: { id, user }
    });
  }

  @Auth({ scopes: [ApplicationScopes.MOVE_FOLDERS] })
  @Patch(":id/move")
  @UseInterceptors(TransactionalInterceptor)
  move(
    @Body() dto: MoveFolderDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<Folder> {
    return this.foldersService.move({
      destination: { id: dto.parent, user },
      source: { id, user }
    });
  }

  @Auth({ scopes: [ApplicationScopes.RENAME_FOLDERS] })
  @Patch(":id/rename")
  rename(
    @Body() dto: RenameFolderDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<Folder> {
    return this.foldersService.rename({
      folder: { id, user },
      name: dto.name
    });
  }
}
