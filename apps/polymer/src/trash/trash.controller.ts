import { Controller, Delete, Get, Param, Post, UseFilters } from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { TrashByIdPipe } from "./pipes/trash-by-id.pipe";

import { TrashExceptionFilter } from "./trash.filter";
import { TrashService } from "./trash.service";

import { Trash } from "./entities/trash.entity";
import { User } from "../user/entities/user.entity";

@Controller("trash")
@UseFilters(TrashExceptionFilter)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Auth({ scopes: [ApplicationScopes.DELETE_FILE_PERMANENTLY] })
  @Delete("empty")
  @Transactional()
  deleteAll(@CurrentUser() user: User): Promise<void> {
    return this.trashService.deleteAll(user);
  }

  @Auth({ scopes: [ApplicationScopes.DELETE_FILE_PERMANENTLY] })
  @Delete(":id")
  @Transactional()
  deleteOne(@Param("id", TrashByIdPipe) trash: Trash): Promise<Trash> {
    return this.trashService.deleteOne(trash);
  }

  @Auth({ scopes: [ApplicationScopes.READ_FILE_METADATA] })
  @Get(":id")
  findOne(@Param("id", TrashByIdPipe) trash: Trash): Trash {
    return trash;
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_CONTENT] })
  @Post(":id/restore")
  @Transactional()
  restore(@Param("id", TrashByIdPipe) trash: Trash): Promise<Trash> {
    return this.trashService.restore(trash);
  }
}
