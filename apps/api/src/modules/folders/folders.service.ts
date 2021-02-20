import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "./folder.entity";
import { FolderRepository } from "./folder.repository";

import { CreateFolder } from "./interfaces/create-folder.interface";

import {
  FolderAlreadyExistsException,
  FolderCannotBeDeletedException,
  FolderCannotBeMovedException,
  FolderNotFoundException,
  ParentFolderNotFoundException
} from "./folder.exceptions";

@Injectable()
export class FoldersService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get folderRepository() {
    return this.uowService.getCustomRepository(FolderRepository);
  }

  async create(payload: CreateFolder): Promise<FolderEntity> {
    const parent = await this.folderRepository.findOneWithRelations({
      id: payload.parent,
      user: payload.user
    });

    if (!parent) {
      throw new ParentFolderNotFoundException();
    }

    const exists = await this.folderRepository.findOneWithRelations({
      name: payload.name,
      parent,
      user: payload.user
    });

    if (exists) {
      throw new FolderAlreadyExistsException(payload.name, parent.name);
    }

    const folder = this.folderRepository.create({
      name: payload.name,
      parent,
      user: payload.user
    });

    return this.folderRepository.save(folder);
  }

  async deleteOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOneWithRelations(conditions);

    if (!folder) {
      throw new FolderNotFoundException();
    }

    // Don't delete root folders
    if (!folder.parent) {
      throw new FolderCannotBeDeletedException();
    }

    return this.folderRepository.remove(folder);
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOneWithRelations(conditions);
  }

  async findOneOrFail(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOneWithRelations(conditions);

    if (!folder) {
      throw new FolderNotFoundException();
    }

    return folder;
  }

  async move(
    from: FindConditions<FolderEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const source = await this.folderRepository.findOneWithRelations(from);

    if (!source) {
      throw new FolderNotFoundException();
    }

    const destination = await this.folderRepository.findOneWithRelations(to);

    if (!destination) {
      throw new FolderNotFoundException();
    }

    // Prevent folder from being moved into itself or its childrens
    const destinationIsChildrenOrSelf = await this.folderRepository.hasDescendant(
      source,
      destination
    );

    if (destinationIsChildrenOrSelf) {
      throw new FolderCannotBeMovedException(source.name, destination.name);
    }

    return this.folderRepository.move(source, destination);
  }
}