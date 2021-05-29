import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { RepositoriesService } from "../repositories/repositories.service";

import { Application } from "./entities/application.entity";
import { User } from "../user/entities/user.entity";

import { ApplicationScopes } from "./enums/application-scopes.enum";

import { ApplicationConflictException } from "./applications.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  private get applicationRepository(): EntityRepository<Application> {
    return this.repositoriesService.getRepository(Application);
  }

  /**
   * Create a new application if it does not exist
   */
  async create(name: string, scopes: ApplicationScopes[], owner: User): Promise<Application> {
    const duplicate = await this.applicationRepository.findOne({ name, owner });

    if (duplicate) {
      throw new ApplicationConflictException();
    }

    const application = new Application();

    application.name = name;
    application.owner = owner;
    application.scopes = scopes;

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }

  /**
   * Delete an application
   */
  async deleteOne(application: Application): Promise<Application> {
    await this.applicationRepository.removeAndFlush(application);

    return application;
  }

  async findOne(filter: FilterQuery<Application>): Promise<Application | null> {
    return this.applicationRepository.findOne(filter);
  }

  /**
   * Generate a new secret for an application
   */
  async regenerateSecret(application: Application): Promise<Application> {
    application.secret = await application.generateSecret();

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }

  /**
   * Updates the name or scope of an application
   */
  async updateOne(
    application: Application,
    name?: string,
    scopes?: ApplicationScopes[]
  ): Promise<Application> {
    if (name) {
      application.name = name;
    }

    if (scopes) {
      application.scopes = scopes;
    }

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }

  @OnEvent("user.deleted")
  private async handleUserDeletion(user: User): Promise<void> {
    await this.applicationRepository.nativeDelete({ owner: user });
  }
}
