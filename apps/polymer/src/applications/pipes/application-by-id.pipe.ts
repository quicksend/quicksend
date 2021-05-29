import { Injectable, PipeTransform } from "@nestjs/common";

import { RequestContext } from "../../common/contexts/request.context";

import { ApplicationsService } from "../applications.service";

import { Application } from "../entities/application.entity";

import { ApplicationNotFoundException } from "../applications.exceptions";

@Injectable()
export class ApplicationByIdPipe implements PipeTransform {
  constructor(private readonly applicationsService: ApplicationsService) {}

  async transform(id: string): Promise<Application> {
    const user = RequestContext.getItem("user");

    if (!user) {
      throw new ApplicationNotFoundException();
    }

    const application = await this.applicationsService.findOne({
      id,
      owner: user
    });

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    return application;
  }
}
