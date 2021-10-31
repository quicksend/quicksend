import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";

import { Profile } from "./entities/profile.entity";

import { ProfileEvent } from "./events/profile.event";

import { ProfileNotFoundException, UserConflictException } from "./profiles.exceptions";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService
  ) {}

  private get profileRepository(): EntityRepository<Profile> {
    return this.entityManagerService.getRepository(Profile);
  }

  async create(user: any): Promise<Profile> {
    const duplicate = await this.profileRepository.findOne({ user: user.id }, { filters: false });

    if (duplicate) {
      throw new UserConflictException();
    }

    const profile = new Profile({
      displayName: user.displayName,
      user: user.id
    });

    await this.profileRepository.persistAndFlush(profile);

    await this.brokerService.emitAsync(ProfileEvent.CREATED, {
      created: profile
    });

    return profile;
  }

  async deleteOne(filter: FilterQuery<Profile>): Promise<Profile> {
    const profile = await this.profileRepository.findOne(filter);

    if (!profile) {
      throw new ProfileNotFoundException();
    }

    await this.profileRepository.removeAndFlush(profile);

    await this.brokerService.emitAsync(ProfileEvent.DELETED, {
      deleted: profile
    });

    return profile;
  }

  async findOne(filter: FilterQuery<Profile>): Promise<Profile> {
    const profile = await this.profileRepository.findOne(filter);

    if (!profile) {
      throw new ProfileNotFoundException();
    }

    return profile;
  }
}
