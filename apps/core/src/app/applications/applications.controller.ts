import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import { Transactional } from "../common/decorators/transactional.decorator";

import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";

import { CreateApplicationPayload } from "./payloads/create-application.payload";
import { DeleteApplicationPayload } from "./payloads/delete-application.payload";
import { FindApplicationPayload } from "./payloads/find-application.payload";
import { ResetApplicationSecretPayload } from "./payloads/reset-application-secret.payload";
import { UpdateApplicationPayload } from "./payloads/update-application.payload";

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @MessagePattern("applications.application.create")
  @Transactional()
  create(@Payload() payload: CreateApplicationPayload): Promise<Application> {
    return this.applicationsService.create({
      createdBy: payload.createdBy,
      name: payload.name,
      scopes: payload.scopes
    });
  }

  @MessagePattern("applications.application.delete")
  @Transactional()
  deleteOne(@Payload() payload: DeleteApplicationPayload): Promise<Application> {
    return this.applicationsService.deleteOne(payload);
  }

  @MessagePattern("applications.application.find")
  findOne(@Payload() payload: FindApplicationPayload): Promise<Application> {
    return this.applicationsService.findOne(payload);
  }

  @MessagePattern("applications.application.reset")
  @Transactional()
  reset(@Payload() payload: ResetApplicationSecretPayload): Promise<Application> {
    return this.applicationsService.reset(payload);
  }

  @MessagePattern("applications.application.update")
  @Transactional()
  updateOne(@Payload() payload: UpdateApplicationPayload): Promise<Application> {
    return this.applicationsService.updateOne(payload.application, payload.data);
  }

  @EventPattern("auth.user.deleted")
  handleUserDeletion(payload: any): Promise<void> {
    return this.applicationsService.deleteMany({
      createdBy: payload.deleted.id
    });
  }
}
