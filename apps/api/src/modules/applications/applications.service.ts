import { ConfigType } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { btoa, generateId } from "@quicksend/utils";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ApplicationEntity } from "./application.entity";
import { UserEntity } from "../user/user.entity";

import { ApplicationScopesEnum } from "./enums/application-scopes.enum";

import {
  ApplicationConflictException,
  CantFindApplicationException
} from "./application.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get applicationRepository() {
    return this.uowService.getRepository(ApplicationEntity);
  }

  async create(dto: {
    name: string;
    scopes: ApplicationScopesEnum[];
    user: UserEntity;
  }): Promise<ApplicationEntity> {
    const duplicate = await this.applicationRepository.findOne({
      name: dto.name,
      user: dto.user
    });

    if (duplicate) {
      throw new ApplicationConflictException();
    }

    const application = this.applicationRepository.create(dto);

    return this.applicationRepository.save(application);
  }

  async deleteOne(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    return this.applicationRepository.remove(application);
  }

  async findOne(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity | undefined> {
    return this.applicationRepository.findOne(conditions);
  }

  async findOneOrFail(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    return application;
  }

  async generateToken(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<string> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    application.secret = await generateId(10);

    await this.applicationRepository.save(application);

    return btoa(`${application.id}:${application.secret}`);
  }
}
