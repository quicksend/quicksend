import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { ApplicationScopes } from "@quicksend/types";

import { Application } from "./entities/application.entity";

import {
  ApplicationConflictException,
  ApplicationNotFoundException
} from "./applications.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: EntityRepository<Application>
  ) {}

  async create(name: string, owner: string, scopes: ApplicationScopes[]): Promise<Application> {
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

  async deleteMany(filter: FilterQuery<Application>): Promise<void> {
    await this.applicationRepository.nativeDelete(filter);
  }

  async deleteOne(filter: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    await this.applicationRepository.removeAndFlush(application);

    return application;
  }

  async findOne(filter: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    return application;
  }

  async resetSecret(filter: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    application.secret = await application.generateSecret();

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }

  async updateOne(
    filter: FilterQuery<Application>,
    data: Partial<Pick<Application, "name" | "scopes">>
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    if (data.name) {
      application.name = data.name;
    }

    if (data.scopes) {
      application.scopes = data.scopes;
    }

    await this.applicationRepository.persistAndFlush(application);

    return application;
  }
}
