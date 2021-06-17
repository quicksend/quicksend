import { Controller, UseFilters } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import {
  CreateApplicationPattern,
  DeleteApplicationPattern,
  FindApplicationPattern,
  ResetApplicationSecretPattern,
  UpdateApplicationPattern,
  UserDeletedPattern,
  UserDeletedPayload
} from "@quicksend/types";

import { ApplicationsExceptionFilter } from "./applications.filter";
import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";

import { CreateApplicationPayload } from "./payloads/create-application.payload";
import { DeleteApplicationPayload } from "./payloads/delete-application.payload";
import { FindApplicationPayload } from "./payloads/find-application.payload";
import { ResetApplicationSecretPayload } from "./payloads/reset-application-secret.payload";
import { UpdateApplicationPayload } from "./payloads/update-application.payload";

@Controller()
@UseFilters(ApplicationsExceptionFilter)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @MessagePattern<CreateApplicationPattern>("applications.application.create")
  create(@Payload() payload: CreateApplicationPayload): Promise<Application> {
    return this.applicationsService.create(payload.name, payload.owner, payload.scopes);
  }

  @MessagePattern<DeleteApplicationPattern>("applications.application.delete")
  deleteOne(@Payload() payload: DeleteApplicationPayload): Promise<Application> {
    return this.applicationsService.deleteOne(payload.application);
  }

  @MessagePattern<FindApplicationPattern>("applications.application.find")
  findOne(@Payload() payload: FindApplicationPayload): Promise<Application> {
    return this.applicationsService.findOne(payload.application);
  }

  @MessagePattern<ResetApplicationSecretPattern>("applications.application.reset-secret")
  resetSecret(@Payload() payload: ResetApplicationSecretPayload): Promise<Application> {
    return this.applicationsService.resetSecret(payload.application);
  }

  @MessagePattern<UpdateApplicationPattern>("applications.application.update")
  updateOne(@Payload() payload: UpdateApplicationPayload): Promise<Application> {
    return this.applicationsService.updateOne(payload.application, payload.data);
  }

  @EventPattern<UserDeletedPattern>("users.user.deleted")
  handleUserDeletion(payload: UserDeletedPayload): Promise<void> {
    return this.applicationsService.deleteMany({
      owner: payload.user.id
    });
  }
}
