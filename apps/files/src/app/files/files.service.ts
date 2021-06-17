import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { FilterQuery, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { FileCapabilities } from "@quicksend/types";
import { LTreeRepository } from "@quicksend/common";

import { File } from "./entities/file.entity";

import { TrashEvents } from "../trash/trash.events";

import {
  FileConflictException,
  FileDestinationCannotBeChildrenOfSelf,
  FileDestinationNotFoundException,
  FileIncapableException,
  FileNotFoundException,
  ParentIncapableException
} from "./files.exceptions";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: LTreeRepository<File>
  ) {}

  // TODO: Doesn't copy folder contents
  async copy(from: FilterQuery<File>, to: FilterQuery<File>): Promise<File> {
    const source = await this.fileRepository.findOne(from);

    if (!source) {
      throw new FileNotFoundException();
    }

    if (!source.hasCapabilities(FileCapabilities.CAN_COPY)) {
      throw new FileIncapableException(FileCapabilities.CAN_COPY);
    }

    const destination = await this.fileRepository.findOne(to);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    if (!destination.hasCapabilities(FileCapabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(FileCapabilities.CAN_ADD_CHILDREN);
    }

    if (destination.isTrashBin) {
      throw new ParentIncapableException(FileCapabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parentRef: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const copy = new File();

    copy.capabilities = source.capabilities;
    copy.hash = source.hash;
    copy.name = source.name;
    copy.owner = destination.owner;
    copy.size = source.size;
    copy.setParent(destination);

    await this.fileRepository.insertLeafNode(copy, destination);

    return copy;
  }

  async createFile(
    hash: string,
    name: string,
    size: number,
    parent: FilterQuery<File>
  ): Promise<File> {
    const destination = await this.fileRepository.findOne(parent);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    if (!destination.hasCapabilities(FileCapabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(FileCapabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name,
      parentRef: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const file = new File();

    file.hash = hash;
    file.name = name;
    file.owner = destination.owner;
    file.size = size;

    file
      .setCapabilities(
        FileCapabilities.CAN_COPY,
        FileCapabilities.CAN_DELETE,
        FileCapabilities.CAN_MOVE,
        FileCapabilities.CAN_RENAME,
        FileCapabilities.CAN_SHARE,
        FileCapabilities.CAN_STREAM,
        FileCapabilities.CAN_UNSHARE
      )
      .setParent(destination);

    return file;
  }

  async createLeafFolder(name: string, parent: FilterQuery<File>): Promise<File> {
    const destination = await this.fileRepository.findOne(parent);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    if (!destination.hasCapabilities(FileCapabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(FileCapabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name,
      parentRef: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const folder = new File();

    folder.name = name;
    folder.owner = destination.owner;

    folder
      .setCapabilities(
        FileCapabilities.CAN_ADD_CHILDREN,
        FileCapabilities.CAN_DELETE,
        FileCapabilities.CAN_LIST_CHILDREN,
        FileCapabilities.CAN_MOVE,
        FileCapabilities.CAN_REMOVE_CHILDREN,
        FileCapabilities.CAN_RENAME,
        FileCapabilities.CAN_SHARE,
        FileCapabilities.CAN_UNSHARE
      )
      .setParent(destination);

    await this.fileRepository.insertLeafNode(folder, destination);

    return folder;
  }

  async createRootFolder(
    name: string,
    owner: string,
    capabilities: FileCapabilities[]
  ): Promise<File> {
    const duplicate = await this.fileRepository.findOne({
      name,
      parentRef: null
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const folder = new File();

    folder.name = name;
    folder.owner = owner;
    folder.setCapabilities(...capabilities);

    await this.fileRepository.insertRootNode(folder);

    return folder;
  }

  async deleteMany(filter: FilterQuery<File>): Promise<void> {
    await this.fileRepository.nativeDelete(filter);
  }

  async deleteOne(filter: FilterQuery<File>): Promise<File> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    await this.fileRepository.removeAndFlush(file);

    return file;
  }

  async findOne(filter: FilterQuery<File>): Promise<File> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    return file;
  }

  async hasDescendant(folder: File, file: File): Promise<boolean> {
    return this.fileRepository.hasDescendant(folder.path, file.path);
  }

  async list(filter: FilterQuery<File>, limit: number, after?: string): Promise<File[]> {
    const folder = await this.fileRepository.findOne(filter);

    if (!folder) {
      throw new FileNotFoundException();
    }

    if (!folder.hasCapabilities(FileCapabilities.CAN_LIST_CHILDREN)) {
      throw new FileIncapableException(FileCapabilities.CAN_LIST_CHILDREN);
    }

    const query: FilterQuery<File> = {
      parentRef: folder
    };

    if (after) {
      const file = await this.fileRepository.findOne({
        id: after
      });

      if (file) {
        query.name = {
          $gt: file.name
        };
      }
    }

    return this.fileRepository.find(query, {
      limit,
      orderBy: {
        name: QueryOrder.ASC
      }
    });
  }

  async move(from: FilterQuery<File>, to: FilterQuery<File>): Promise<File> {
    const source = await this.fileRepository.findOne(from);

    if (!source) {
      throw new FileNotFoundException();
    }

    if (!source.hasCapabilities(FileCapabilities.CAN_MOVE)) {
      throw new FileIncapableException(FileCapabilities.CAN_MOVE);
    }

    const currentDestination = await source.parentRef?.load();

    if (!currentDestination?.hasCapabilities(FileCapabilities.CAN_REMOVE_CHILDREN)) {
      throw new ParentIncapableException(FileCapabilities.CAN_REMOVE_CHILDREN);
    }

    const destination = await this.fileRepository.findOne(to);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    if (!destination.hasCapabilities(FileCapabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(FileCapabilities.CAN_ADD_CHILDREN);
    }

    const destinationIsChildrenOfSource = await this.fileRepository.hasDescendant(
      destination.path,
      source.path
    );

    if (destinationIsChildrenOfSource) {
      throw new FileDestinationCannotBeChildrenOfSelf();
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parentRef: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    await this.fileRepository.moveSubtree(source.path, destination.path);

    source.setParent(destination);

    await this.fileRepository.persistAndFlush(source);

    return source;
  }

  async rename(filter: FilterQuery<File>, newName: string): Promise<File> {
    const file = await this.fileRepository.findOne(filter);

    if (!file) {
      throw new FileNotFoundException();
    }

    if (!file.hasCapabilities(FileCapabilities.CAN_RENAME)) {
      throw new FileIncapableException(FileCapabilities.CAN_RENAME);
    }

    const duplicate = await this.fileRepository.findOne({
      name: newName,
      parentRef: file.parentRef
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    file.name = newName;

    await this.fileRepository.persistAndFlush(file);

    return file;
  }

  @OnEvent(TrashEvents.ITEM_DELETED)
  private async handleTrashDeletion(fileId: string): Promise<void> {
    const file = await this.fileRepository.findOne(fileId);

    if (file) {
      await this.fileRepository.removeSubtree(file.path);
    }
  }

  @OnEvent(TrashEvents.BIN_EMPTIED)
  private async handleTrashDepletion(userId: string): Promise<void> {
    const trashBin = await this.fileRepository.findOne({
      name: "trash",
      owner: userId,
      parent: null
    });

    if (!trashBin) {
      throw new Error(`Trash bin not found for user '${userId}'`);
    }

    await this.fileRepository.removeDescendants(trashBin.path);
  }

  @OnEvent(TrashEvents.ITEM_RESTORED)
  private async handleTrashRestoration(fileId: string, originalParentId?: string): Promise<void> {
    const file = await this.fileRepository.findOne(fileId);

    if (!file) {
      throw new FileNotFoundException();
    }

    const originalParent = originalParentId
      ? await this.fileRepository.findOne(originalParentId)
      : null;

    if (!originalParent) {
      throw new FileDestinationNotFoundException();
    }

    await this.fileRepository.moveSubtree(file.path, originalParent.path);

    file.setParent(originalParent);

    await this.fileRepository.persistAndFlush(file);
  }
}
