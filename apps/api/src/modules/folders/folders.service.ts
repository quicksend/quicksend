import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "./folder.entity";
import { FolderRepository } from "./folder.repository";

import { CreateFolder } from "./interfaces/create-folder.interface";

import {
  CantDeleteFolderException,
  CantFindDestinationFolderException,
  CantFindFolderException,
  CantMoveFolderException,
  CantMoveFolderIntoChildrenException,
  CantMoveFolderIntoItselfException,
  FolderConflictException
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
      throw new CantFindDestinationFolderException();
    }

    const duplicate = await this.folderRepository.findOneWithRelations({
      name: payload.name,
      parent,
      user: payload.user
    });

    if (duplicate) {
      throw new FolderConflictException();
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
      throw new CantFindFolderException();
    }

    // Don't delete root folders
    if (!folder.parent) {
      throw new CantDeleteFolderException();
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
      throw new CantFindFolderException();
    }

    return folder;
  }

  async move(
    from: FindConditions<FolderEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const source = await this.folderRepository.findOneWithRelations(from);

    if (!source) {
      throw new CantFindFolderException();
    }

    // Don't move root folders
    if (!source.parent) {
      throw new CantMoveFolderException();
    }

    const destination = await this.folderRepository.findOneWithRelations(to);

    if (!destination) {
      throw new CantFindDestinationFolderException();
    }

    if (source.id === destination.id) {
      throw new CantMoveFolderIntoItselfException();
    }

    const destinationIsChildren = await this.folderRepository.hasDescendant(
      source,
      destination
    );

    if (destinationIsChildren) {
      throw new CantMoveFolderIntoChildrenException();
    }

    return this.folderRepository.move(source, destination);
  }
}
