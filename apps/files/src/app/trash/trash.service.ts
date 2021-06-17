import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { File } from "../files/entities/file.entity";
import { Trash } from "./entities/trash.entity";

import { TrashNotFoundException } from "./trash.exceptions";

@Injectable()
export class TrashService {
  constructor(
    @InjectRepository(Trash)
    private readonly trashRepository: EntityRepository<Trash>
  ) {}

  async create(file: File, originalParent?: File): Promise<Trash> {
    const trash = new Trash();

    trash.file = file;
    trash.originalParent = originalParent;
    trash.owner = originalParent?.owner || file.owner;

    await this.trashRepository.persistAndFlush(trash);

    return trash;
  }

  async deleteMany(filter: FilterQuery<Trash>): Promise<void> {
    await this.trashRepository.nativeDelete(filter);
  }

  async deleteOne(filter: FilterQuery<Trash>): Promise<Trash> {
    const trash = await this.trashRepository.findOne(filter);

    if (!trash) {
      throw new TrashNotFoundException();
    }

    await this.trashRepository.removeAndFlush(trash);

    return trash;
  }

  async findOne(filter: FilterQuery<Trash>): Promise<Trash> {
    const trash = await this.trashRepository.findOne(filter);

    if (!trash) {
      throw new TrashNotFoundException();
    }

    return trash;
  }
}
