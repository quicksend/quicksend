import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "./folder.entity";
import { UserEntity } from "../user/user.entity";

import { FolderRepository } from "./folder.repository";

import {
  CantDeleteFolderException,
  CantFindDestinationFolderException,
  CantFindFolderException,
  CantMoveFolderException,
  CantMoveFolderIntoChildrenException,
  CantMoveFolderIntoItselfException,
  CantRenameFolderException,
  FolderConflictException
} from "./folders.exceptions";

@Injectable()
export class FoldersService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get folderRepository() {
    return this.uowService.getCustomRepository(FolderRepository);
  }

  // TODO: add method to allow copying folders maybe?

  /**
   * Create a new folder if it does not exist
   */
  async create(
    name: string,
    parentId: string,
    user: UserEntity
  ): Promise<FolderEntity> {
    const parent = await this.folderRepository.findOneWithRelations({
      id: parentId,
      user
    });

    if (!parent) {
      throw new CantFindDestinationFolderException();
    }

    const duplicate = await this.folderRepository.findOneWithRelations({
      name,
      parent,
      user
    });

    if (duplicate) {
      throw new FolderConflictException();
    }

    const folder = this.folderRepository.create({ name, parent, user });

    return this.folderRepository.save(folder);
  }

  /**
   * Delete a folder and all its children (including files)
   */
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

  /**
   * Find a folder or returns undefined if it does not exist
   */
  async findOne(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity | undefined> {
    return this.folderRepository.findOneWithRelations(conditions);
  }

  /**
   * Find a folder or throw an error if it does not exist
   */
  async findOneOrFail(
    conditions: FindConditions<FolderEntity>
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOneWithRelations(conditions);

    if (!folder) {
      throw new CantFindFolderException();
    }

    return folder;
  }

  /**
   * Move a folder to a new location
   */
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

  /**
   * Rename a folder with a new name
   */
  async rename(
    conditions: FindConditions<FolderEntity>,
    newName: string
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOneWithRelations(conditions);

    if (!folder) {
      throw new CantFindFolderException();
    }

    // Don't rename root folders
    if (!folder.parent) {
      throw new CantRenameFolderException();
    }

    const duplicate = await this.folderRepository.findOneWithRelations({
      name: newName,
      parent: folder.parent,
      user: folder.user
    });

    if (duplicate) {
      throw new FolderConflictException();
    }

    folder.name = newName;

    return this.folderRepository.save(folder);
  }
}
