import { Body, Controller, Delete, Get, Param, Post, UseFilters } from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";
import { User } from "../user/entities/user.entity";

import { CreateApplicationDto } from "./dto/create-application.dto";

import { ApplicationsExceptionFilter } from "./applications.filter";

@Auth()
@Controller("applications")
@UseFilters(ApplicationsExceptionFilter)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: User): Promise<Application> {
    return this.applicationsService.create(dto.name, dto.scopes, user);
  }

  @Get(":id")
  find(@CurrentUser() user: User, @Param("id") id: string): Promise<Application> {
    return this.applicationsService.findOneOrFail({ id, user });
  }

  @Delete(":id/delete")
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<Application> {
    return this.applicationsService.deleteOne({ id, user });
  }

  @Post(":id/regenerate-secret")
  regenerateSecret(@CurrentUser() user: User, @Param("id") id: string): Promise<Application> {
    return this.applicationsService.regenerateSecret({ id, user });
  }
}
