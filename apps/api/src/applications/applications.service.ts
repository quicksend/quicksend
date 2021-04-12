import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { RepositoriesService } from "../repositories/repositories.service";

import { Application } from "./entities/application.entity";
import { User } from "../user/entities/user.entity";

import { ApplicationScopes } from "./enums/application-scopes.enum";

import {
  ApplicationConflictException,
  CantFindApplicationException
} from "./applications.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  private get applicationRepository(): EntityRepository<Application> {
    return this.repositoriesService.getRepository(Application);
  }

  /**
   * Create a new application if it does not exist
   */
  async create(name: string, scopes: ApplicationScopes[], user: User): Promise<Application> {
    const duplicate = await this.applicationRepository.findOne({ name, user });

    if (duplicate) {
      throw new ApplicationConflictException();
    }

    const application = this.applicationRepository.create({ name, scopes, user });

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }

  /**
   * Delete an application
   */
  async deleteOne(conditions: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    await this.applicationRepository.remove(application);

    return application;
  }

  /**
   * Find an application or returns undefined if it does not exist
   */
  async findOne(conditions: FilterQuery<Application>): Promise<Application | null> {
    return this.applicationRepository.findOne(conditions);
  }

  /**
   * Find an application or throw an error if it does not exist
   */
  async findOneOrFail(conditions: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    return application;
  }

  /**
   * Generate a new secret for an application and return the formatted token
   */
  async regenerateSecret(conditions: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    application.secret = await application.generateSecret();

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }
}
