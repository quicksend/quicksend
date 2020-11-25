import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FindConditions, Repository } from "typeorm";

import { FileService } from "../file/file.service";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import {
  FolderAlreadyExistsException,
  FolderNotFoundException,
  ParentFolderNotFoundException
} from "./folder.exceptions";

@Injectable()
export class FolderService {
  constructor(
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,

    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>
  ) {}

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
      throw new ParentFolderNotFoundException();
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
      throw new FolderAlreadyExistsException(payload.name, parent.name);
    }

    return this.folderRepository.save(folder);
  }

  async deleteOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne(conditions);
    if (!folder) throw new FolderNotFoundException();

    if (folder.isRoot) {
      // Throw error
    }

    return this.folderRepository.remove(folder);
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOne(conditions);
  }
}
