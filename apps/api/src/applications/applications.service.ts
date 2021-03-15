import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { generateRandomString } from "@quicksend/utils";

import { TransactionService } from "../transaction/transaction.service";

import { ApplicationEntity } from "./application.entity";
import { UserEntity } from "../user/user.entity";

import { ApplicationScopesEnum } from "./enums/application-scopes.enum";

import {
  ApplicationConflictException,
  CantFindApplicationException
} from "./applications.exceptions";

@Injectable()
export class ApplicationsService {
  constructor(private readonly transactionService: TransactionService) {}

  private get applicationRepository() {
    return this.transactionService.getRepository(ApplicationEntity);
  }

  /**
   * Create a new application if it does not exist
   */
  async create(
    name: string,
    scopes: ApplicationScopesEnum[],
    user: UserEntity
  ): Promise<ApplicationEntity> {
    const duplicate = await this.applicationRepository.findOne({ name, user });

    if (duplicate) {
      throw new ApplicationConflictException();
    }

    const secret = await this._generateSecret();

    const application = this.applicationRepository.create({
      name,
      scopes,
      secret,
      user
    });

    return this.applicationRepository.save(application);
  }

  /**
   * Delete an application
   */
  async deleteOne(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    return this.applicationRepository.remove(application);
  }

  /**
   * Find an application or returns undefined if it does not exist
   */
  async findOne(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity | undefined> {
    return this.applicationRepository.findOne(conditions);
  }

  /**
   * Find an application or throw an error if it does not exist
   */
  async findOneOrFail(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    return application;
  }

  /**
   * Generate a new secret for an application and return the formatted token
   */
  async regenerateSecret(
    conditions: FindConditions<ApplicationEntity>
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne(conditions);

    if (!application) {
      throw new CantFindApplicationException();
    }

    application.secret = await this._generateSecret();

    return this.applicationRepository.save(application);
  }

  private _generateSecret(): Promise<string> {
    return generateRandomString(10);
  }
}
