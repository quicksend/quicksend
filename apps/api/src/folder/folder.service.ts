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
export class FolderService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get folderRepository() {
    return this.uowService.getCustomRepository(FolderRepository);
  }

  async create(payload: CreateFolder): Promise<FolderEntity> {
    const parent = await this.findOne({
      id: payload.parent,
      user: payload.user
    });

    if (!parent) {
      throw new ParentFolderNotFoundException();
    }

    const folder = this.folderRepository.create({
      name: payload.name,
      parent,
      user: payload.user
    });

    if (await this.findOne(folder)) {
      throw new FolderAlreadyExistsException(payload.name, parent.name);
    }

    return this.folderRepository.save(folder);
  }

  async deleteOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.findOne(conditions);

    if (!folder) throw new FolderNotFoundException();
    if (!folder.parent) throw new FolderCannotBeDeletedException(); // Don't delete root folders

    return this.folderRepository.remove(folder);
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOne(conditions, {
      relations: ["parent"]
    });
  }

  async findOneOrFail(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.findOne(conditions);
    if (!folder) throw new FolderNotFoundException();

    return folder;
  }

  async move(
    from: FindConditions<FolderEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const source = await this.findOne(from);
    if (!source) throw new FolderNotFoundException();

    const destination = await this.findOne(to);
    if (!destination) throw new FolderNotFoundException();

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
