import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";

import { Application } from "./entities/application.entity";

import { Scope } from "./enums/scope.enum";

import { ApplicationEvent } from "./events/application.event";

import {
  ApplicationConflictException,
  ApplicationNotFoundException
} from "./applications.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService
  ) {}

  private get applicationRepository(): EntityRepository<Application> {
    return this.entityManagerService.getRepository(Application);
  }

  async create(options: {
    createdBy: string;
    name: string;
    scopes: Scope[];
  }): Promise<Application> {
    const duplicate = await this.applicationRepository.findOne({
      createdBy: options.createdBy,
      name: options.name
    });

    if (duplicate) {
      throw new ApplicationConflictException();
    }

    const application = new Application({
      createdBy: options.createdBy,
      name: options.name,
      scopes: options.scopes
    });

    await this.applicationRepository.persistAndFlush(application);

    await this.brokerService.emitAsync(ApplicationEvent.CREATED, {
      created: application
    });

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

    await this.brokerService.emitAsync(ApplicationEvent.DELETED, {
      deleted: application
    });

    return application;
  }

  async findOne(filter: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    return application;
  }

  async reset(filter: FilterQuery<Application>): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    const oldApplication = Object.assign({}, application);

    application.secret = await application.generateSecret();

    await this.applicationRepository.persistAndFlush(application);

    await this.brokerService.emitAsync(ApplicationEvent.UPDATED, {
      new: application,
      old: oldApplication
    });

    return application;
  }

  async updateOne(
    filter: FilterQuery<Application>,
    data: Partial<Omit<Application, "createdBy">>
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne(filter);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    const oldApplication = Object.assign({}, application);

    if (data.name) {
      application.name = data.name;
    }

    if (data.scopes) {
      application.scopes = data.scopes;
    }

    await this.applicationRepository.persistAndFlush(application);

    await this.brokerService.emitAsync(ApplicationEvent.UPDATED, {
      new: application,
      old: oldApplication
    });

    return application;
  }
}
