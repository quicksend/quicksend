import { ApiTags } from "@nestjs/swagger";

import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { Observable } from "rxjs";

import { Auth } from "../common/decorators/auth.decorator";

import { ApplicationsService } from "./applications.service";

import { CreateApplicationDto } from "./dtos/create-application.dto";
import { UpdateApplicationDto } from "./dtos/update-application.dto";

import { Application } from "./resources/application.resource";

@ApiTags("Applications")
@Auth()
@Controller({
  path: "apps",
  version: "1"
})
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto): Observable<Application> {
    return this.applicationsService.create({
      name: dto.name,
      owner: "",
      scopes: dto.scopes
    });
  }

  @Get(":app_id")
  findOne(@Param("app_id") appId: string): Observable<Application> {
    return this.applicationsService.findOne({ id: appId });
  }

  @Delete(":app_id/delete")
  deleteOne(@Param("app_id") appId: string): Observable<Application> {
    return this.applicationsService.deleteOne({ id: appId });
  }

  @Post(":app_id/reset")
  reset(@Param("app_id") appId: string): Observable<Application> {
    return this.applicationsService.reset({ id: appId });
  }

  @Patch(":app_id/update")
  updateOne(
    @Param("app_id") appId: string,
    @Body() dto: UpdateApplicationDto
  ): Observable<Application> {
    return this.applicationsService.updateOne({
      application: { id: appId },
      data: dto
    });
  }
}
