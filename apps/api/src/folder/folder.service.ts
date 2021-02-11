import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import {
  FolderAlreadyExistsException,
  FolderCannotBeDeletedException,
  FolderNotFoundException,
  ParentFolderNotFoundException
} from "./folder.exceptions";

@Injectable()
export class FolderService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get folderRepository() {
    return this.uowService.getRepository(FolderEntity);
  }

  async create(payload: {
    name: string;
    parent: string | null;
    user: UserEntity;
  }): Promise<FolderEntity> {
    const parent = await this.folderRepository.findOne(
      payload.parent
        ? { id: payload.parent, user: payload.user }
        : { parent: null, user: payload.user }
    );

    if (!parent) {
      throw new ParentFolderNotFoundException();
    }

    const folder = this.folderRepository.create({
      name: payload.name,
      parent,
      user: payload.user
    });

    const exist = await this.folderRepository.findOne(folder);

    if (exist) {
      throw new FolderAlreadyExistsException(payload.name, parent.name);
    }

    return this.folderRepository.save(folder);
  }

  async deleteOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne(conditions, {
      relations: ["parent"]
    });

    if (!folder) throw new FolderNotFoundException();
    if (!folder.parent) throw new FolderCannotBeDeletedException(); // Don't delete root folders

    await this.folderRepository.remove(folder);

    return folder;
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOne(conditions);
  }

  async move() {}
}
