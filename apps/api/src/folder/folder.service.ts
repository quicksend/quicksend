import { Inject, Injectable, forwardRef } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { FileService } from "../file/file.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "./entities/folder.entity";
import { UserEntity } from "../user/entities/user.entity";

import {
  FolderAlreadyExists,
  FolderNotFound,
  ParentFolderNotFound
} from "./folder.exception";

@Injectable()
export class FolderService {
  constructor(
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,

    private readonly uowService: UnitOfWorkService
  ) {}

  get folderRepository() {
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
        : { isRoot: true, user: payload.user }
    );

    if (!parent) {
      throw new ParentFolderNotFound();
    }

    const folder = this.folderRepository.create({
      name: payload.name,
      parent,
      user: payload.user
    });

    const exist =
      (await this.fileService.findOne(folder)) ||
      (await this.folderRepository.findOne(folder));

    if (exist) {
      throw new FolderAlreadyExists(payload.name, parent.name);
    }

    return this.folderRepository.save(folder);
  }

  async deleteOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne(conditions);
    if (!folder) throw new FolderNotFound();

    return this.folderRepository.remove(folder);
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOne(conditions);
  }
}
