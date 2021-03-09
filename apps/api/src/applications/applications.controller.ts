import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { ApplicationsExceptionFilter } from "./applications.filter";
import { ApplicationsService } from "./applications.service";

import { ApplicationEntity } from "./application.entity";
import { UserEntity } from "../user/user.entity";

import { CreateApplicationDto } from "./dto/create-application.dto";

@Controller("applications")
@UseFilters(ApplicationsExceptionFilter)
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApplicationEntity> {
    return this.applicationsService.create(dto.name, dto.scopes, user);
  }

  @Get(":id")
  async find(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<ApplicationEntity> {
    return this.applicationsService.findOneOrFail({ id, user });
  }

  @Delete(":id/delete")
  async delete(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<ApplicationEntity> {
    return this.applicationsService.deleteOne({ id, user });
  }

  @Post(":id/regenerate-secret")
  async regenerateSecret(
    @CurrentUser() user: UserEntity,
    @Param("id") id: string
  ): Promise<ApplicationEntity> {
    return this.applicationsService.regenerateSecret({ id, user });
  }
}
