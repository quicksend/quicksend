import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { ClosureTable } from "../common/repositories/closure-table.repository";

import { RepositoriesService } from "../repositories/repositories.service";

import { Folder } from "./entities/folder.entity";
import { FolderTree } from "./entities/folder-tree.entity";

import { CreateFolderPayload } from "./payloads/create-folder.payload";
import { DeleteFolderPayload } from "./payloads/delete-folder.payload";
import { MoveFolderPayload } from "./payloads/move-folder.payload";
import { RenameFolderPayload } from "./payloads/rename-folder.payload";

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
  constructor(private readonly repositoriesService: RepositoriesService) {}

  private get folderRepository(): EntityRepository<Folder> {
    return this.repositoriesService.getRepository(Folder);
  }

  private get folderTreeRepository(): ClosureTable<FolderTree> {
    return this.repositoriesService.getRepository(FolderTree);
  }

  /**
   * Create a new folder if it does not exist
   */
  async create(payload: CreateFolderPayload): Promise<Folder> {
    if (payload.parent) {
      const parent = await this.folderRepository.findOne(payload.parent);

      if (!parent) {
        throw new CantFindDestinationFolderException();
      }

      const duplicate = await this.folderRepository.findOne({
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

      await this.folderRepository.persistAndFlush(folder);
      await this.folderTreeRepository.insertLeafNode(folder.id, parent.id);

      return folder;
    }

    const duplicate = await this.folderRepository.findOne({
      name: payload.name,
      parent: null,
      user: payload.user
    });

    if (duplicate) {
      throw new FolderConflictException();
    }

    const folder = this.folderRepository.create({
      name: payload.name,
      parent: null,
      user: payload.user
    });

    await this.folderRepository.persistAndFlush(folder);
    await this.folderTreeRepository.insertRootNode(folder.id);

    return folder;
  }

  /**
   * Delete a folder and all its children (including files)
   */
  async deleteOne(payload: DeleteFolderPayload): Promise<Folder> {
    const folder = await this.folderRepository.findOne(payload.folder);

    if (!folder) {
      throw new CantFindFolderException();
    }

    if (!folder.parent && !payload.deleteRoot) {
      throw new CantDeleteFolderException();
    }

    await this.folderTreeRepository.deleteSubtree(folder.id);
    await this.folderRepository.removeAndFlush(folder);

    return folder;
  }

  /**
   * Find a folder or returns null if it does not exist
   */
  async findOne(conditions: FilterQuery<Folder>): Promise<Folder | null> {
    return this.folderRepository.findOne(conditions);
  }

  /**
   * Find a folder or throw an error if it does not exist
   */
  async findOneOrFail(conditions: FilterQuery<Folder>): Promise<Folder> {
    const folder = await this.folderRepository.findOne(conditions);

    if (!folder) {
      throw new CantFindFolderException();
    }

    return folder;
  }

  /**
   * Move a folder to a new location
   */
  async move(payload: MoveFolderPayload): Promise<Folder> {
    const source = await this.folderRepository.findOne(payload.source);

    if (!source) {
      throw new CantFindFolderException();
    }

    if (!source.parent && !payload.moveRoot) {
      throw new CantMoveFolderException();
    }

    const destination = await this.folderRepository.findOne(payload.destination);

    if (!destination) {
      throw new CantFindDestinationFolderException();
    }

    if (source.id === destination.id) {
      throw new CantMoveFolderIntoItselfException();
    }

    const isChildrenOfSource = await this.folderTreeRepository.containsDescendant(
      source.id,
      destination.id
    );

    if (isChildrenOfSource) {
      throw new CantMoveFolderIntoChildrenException();
    }

    source.parent = destination;

    await this.folderRepository.persistAndFlush(source);
    await this.folderTreeRepository.moveSubtree(source.id, destination.id);

    return source;
  }

  /**
   * Rename a folder with a new name
   */
  async rename(payload: RenameFolderPayload): Promise<Folder> {
    const folder = await this.folderRepository.findOne(payload.folder);

    if (!folder) {
      throw new CantFindFolderException();
    }

    if (!folder.parent && !payload.renameRoot) {
      throw new CantRenameFolderException();
    }

    const duplicate = await this.folderRepository.findOne({
      name: payload.name,
      parent: folder.parent,
      user: folder.user
    });

    if (duplicate) {
      throw new FolderConflictException();
    }

    folder.name = payload.name;

    await this.folderRepository.persistAndFlush(folder);

    return folder;
  }
}
