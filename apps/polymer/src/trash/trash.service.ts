import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { RepositoriesService } from "../repositories/repositories.service";

import { File } from "../files/entities/file.entity";
import { Trash } from "./entities/trash.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class TrashService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly repositoriesService: RepositoriesService
  ) {}

  private get trashRepository(): EntityRepository<Trash> {
    return this.repositoriesService.getRepository(Trash);
  }

  async deleteAll(user: User): Promise<void> {
    await this.trashRepository.nativeDelete({ owner: user });

    await this.eventEmitter.emitAsync("trash.emptied", user);
  }

  async deleteOne(trash: Trash): Promise<Trash> {
    await this.trashRepository.removeAndFlush(trash);

    await this.eventEmitter.emitAsync("trash.deleted", trash.file, trash.originalParent);

    return trash;
  }

  async findOne(filter: FilterQuery<Trash>): Promise<Trash | null> {
    return this.trashRepository.findOne(filter);
  }

  async restore(trash: Trash): Promise<Trash> {
    await this.trashRepository.removeAndFlush(trash);

    await this.eventEmitter.emitAsync("trash.restored", trash.file, trash.originalParent);

    return trash;
  }

  @OnEvent("file.moved")
  private async handleFileRelocation(source: File, destination: File): Promise<void> {
    const currentDestination = await source.parent?.load();

    // If it's being moved into the trash bin
    if (destination.isTrashBin) {
      const trash = new Trash();

      trash.file = source;
      trash.originalParent = currentDestination;
      trash.owner = destination.owner;

      await this.trashRepository.persistAndFlush(trash);
    }

    // If it's being moved out of the trash bin
    else if (currentDestination?.isTrashBin && !destination.isTrashBin) {
      await this.trashRepository.nativeDelete({ file: source });
    }
  }

  @OnEvent("user.deleted")
  private async handleUserDeletion(user: User): Promise<void> {
    await this.trashRepository.nativeDelete({ owner: user });
  }
}
