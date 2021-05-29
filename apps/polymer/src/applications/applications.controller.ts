import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ValidateBody } from "../common/decorators/validate-body.decorator";

import { ApplicationsExceptionFilter } from "./applications.filter";
import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";
import { User } from "../user/entities/user.entity";

import { ApplicationScopes } from "./enums/application-scopes.enum";

import { CreateApplicationDto } from "./dtos/create-application.dto";
import { UpdateApplicationDto } from "./dtos/update-application.dto";

import { ApplicationByIdPipe } from "./pipes/application-by-id.pipe";

@Auth()
@Controller("applications")
@UseFilters(ApplicationsExceptionFilter)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ValidateBody(CreateApplicationDto)
  create(
    @Body("name") name: string,
    @Body("scopes") scopes: ApplicationScopes[],
    @CurrentUser() user: User
  ): Promise<Application> {
    return this.applicationsService.create(name, scopes, user);
  }

  @Get(":id")
  findOne(@Param("id", ApplicationByIdPipe) application: Application): Application {
    return application;
  }

  @Delete(":id")
  deleteOne(@Param("id", ApplicationByIdPipe) application: Application): Promise<Application> {
    return this.applicationsService.deleteOne(application);
  }

  @Patch(":id")
  @ValidateBody(UpdateApplicationDto)
  updateOne(
    @Param("id", ApplicationByIdPipe) application: Application,
    @Body("name") name?: string,
    @Body("scopes") scopes?: ApplicationScopes[]
  ): Promise<Application> {
    return this.applicationsService.updateOne(application, name, scopes);
  }

  @Post(":id/regenerate-secret")
  regenerateSecret(
    @Param("id", ApplicationByIdPipe) application: Application
  ): Promise<Application> {
    return this.applicationsService.regenerateSecret(application);
  }
}
