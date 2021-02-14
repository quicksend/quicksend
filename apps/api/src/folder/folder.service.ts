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
    const parent = await this.folderRepository.findOne({
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

    return this.folderRepository.remove(folder);
  }

  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOne(conditions);
  }

  async move(
    from: FindConditions<FolderEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const source = await this.folderRepository.findOne(from);
    if (!source) throw new FolderNotFoundException();

    const destination = await this.folderRepository.findOne(to);
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
