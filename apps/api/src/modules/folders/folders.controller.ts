import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UseApplicationScopes } from "../../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../../common/guards/auth.guard";

import { ApplicationScopesEnum } from "../applications/enums/application-scopes.enum";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FoldersService } from "./folders.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FoldersExceptionFilter } from "./folders.filter";

import { CreateFolderDto } from "./dto/create-folder.dto";
import { MoveFolderDto } from "./dto/move-folder.dto";

@Controller("folders")
@UseFilters(FoldersExceptionFilter)
@UseGuards(AuthGuard)
export class FolderController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly uowService: UnitOfWorkService
  ) {}

  @Post()
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
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

  @Get(":id?")
  @UseApplicationScopes(ApplicationScopesEnum.READ_FOLDER_METADATA)
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id?: string
  ): Promise<FolderEntity> {
    return id
      ? this.foldersService.findOneOrFail({ id, user })
      : this.foldersService.findOneOrFail({ parent: null, user });
  }

  @Delete(":id/delete")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.uowService.withTransaction(() =>
      this.foldersService.deleteOne({ id, user })
    );
  }

  @Patch(":id/move")
  @UseApplicationScopes(ApplicationScopesEnum.WRITE_FOLDER_METADATA)
  async move(
    @Body() dto: MoveFolderDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<FolderEntity> {
    return this.uowService.withTransaction(() =>
      this.foldersService.move({ id, user }, { id: dto.to, user })
    );
  }
}
