import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";

import { FilterQuery, Reference } from "@mikro-orm/core";
import { File as FileMetadata } from "@quicksend/transmit";

import { LTreeRepository } from "../common/repositories/ltree.repository";

import { RepositoriesService } from "../repositories/repositories.service";
import { StorageService } from "../storage/storage.service";

import { File } from "./entities/file.entity";
import { User } from "../user/entities/user.entity";

import { Capabilities } from "./enums/capabilities.enum";

import {
  FileConflictException,
  FileDestinationCannotBeChildrenOfSelf,
  FileIncapableException,
  ParentIncapableException
} from "./files.exceptions";

@Injectable()
export class FilesService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly repositoriesService: RepositoriesService,
    private readonly storageService: StorageService
  ) {}

  private get fileRepository(): LTreeRepository<File> {
    return this.repositoriesService.getRepository(File);
  }

  async copy(source: File, destination: File): Promise<File> {
    if (!source.hasCapabilities(Capabilities.CAN_COPY)) {
      throw new FileIncapableException(Capabilities.CAN_COPY);
    }

    if (!destination.hasCapabilities(Capabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    if (destination.isTrashBin) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parent: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const copy = new File();

    copy.capabilities = source.capabilities;
    copy.hash = source.hash;
    copy.isCabinet = source.isCabinet;
    copy.isTrashBin = source.isTrashBin;
    copy.name = source.name;
    copy.owner = destination.owner;
    copy.parent = Reference.create(destination);
    copy.size = source.size;

    await this.fileRepository.insertLeafNode(copy, destination);

    return copy;
  }

  async createFolder(name: string, destination: File): Promise<File> {
    if (!destination.hasCapabilities(Capabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name,
      parent: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const folder = new File();

    folder.setCapabilities(
      Capabilities.CAN_ADD_CHILDREN,
      Capabilities.CAN_DELETE,
      Capabilities.CAN_LIST_CHILDREN,
      Capabilities.CAN_MOVE,
      Capabilities.CAN_REMOVE_CHILDREN,
      Capabilities.CAN_RENAME,
      Capabilities.CAN_SHARE,
      Capabilities.CAN_UNSHARE
    );

    folder.name = name;
    folder.owner = destination.owner;
    folder.parent = Reference.create(destination);

    await this.fileRepository.insertLeafNode(folder, destination);

    return folder;
  }

  async findFileCabinet(owner: User): Promise<File> {
    const cabinet = await this.fileRepository.findOne({
      isCabinet: true,
      owner
    });

    if (!cabinet) {
      throw new Error(`Failed to find file cabinet for ${owner.id}`);
    }

    return cabinet;
  }

  async findOne(filter: FilterQuery<File>): Promise<File | null> {
    return this.fileRepository.findOne(filter);
  }

  async findTrashBin(owner: User): Promise<File> {
    const trashBin = await this.fileRepository.findOne({
      isTrashBin: true,
      owner
    });

    if (!trashBin) {
      throw new Error(`Failed to find trash bin for ${owner.id}`);
    }

    return trashBin;
  }

  async move(source: File, destination: File): Promise<File> {
    if (!source.hasCapabilities(Capabilities.CAN_MOVE)) {
      throw new FileIncapableException(Capabilities.CAN_MOVE);
    }

    if (!destination.hasCapabilities(Capabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    const currentDestination = await source.parent?.load();

    if (!currentDestination?.hasCapabilities(Capabilities.CAN_REMOVE_CHILDREN)) {
      throw new ParentIncapableException(Capabilities.CAN_REMOVE_CHILDREN);
    }

    const destinationIsChildrenOfSource = await this.fileRepository.isDescendant(
      destination,
      source
    );

    if (destinationIsChildrenOfSource) {
      throw new FileDestinationCannotBeChildrenOfSelf();
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parent: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    await this.eventEmitter.emitAsync("file.moved", source, destination);

    await this.fileRepository.moveSubtree(source.path, destination.path);

    source.parent = Reference.create(destination);

    await this.fileRepository.persistAndFlush(source);

    return source;
  }

  async rename(file: File, newName: string): Promise<File> {
    if (!file.hasCapabilities(Capabilities.CAN_RENAME)) {
      throw new FileIncapableException(Capabilities.CAN_RENAME);
    }

    const duplicate = await this.fileRepository.findOne({
      name: newName,
      parent: file.parent
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    file.name = newName;

    await this.fileRepository.persistAndFlush(file);

    return file;
  }

  async save(metadata: FileMetadata, destination: File): Promise<File> {
    if (!destination.hasCapabilities(Capabilities.CAN_ADD_CHILDREN)) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    if (destination.isTrashBin) {
      throw new ParentIncapableException(Capabilities.CAN_ADD_CHILDREN);
    }

    const duplicate = await this.fileRepository.findOne({
      name: metadata.name,
      parent: destination
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const { isNew, physicalFile } = await this.storageService.create(metadata);

    // If the physical file already exists, delete the one that was just uploaded
    if (!isNew) {
      await this.storageService.remove(physicalFile);
    }

    const file = new File();

    file.setCapabilities(
      Capabilities.CAN_COPY,
      Capabilities.CAN_DELETE,
      Capabilities.CAN_MOVE,
      Capabilities.CAN_RENAME,
      Capabilities.CAN_SHARE,
      Capabilities.CAN_STREAM,
      Capabilities.CAN_UNSHARE
    );

    file.hash = metadata.hash;
    file.name = metadata.name;
    file.owner = destination.owner;
    file.parent = Reference.create(destination);
    file.size = metadata.size;

    await this.fileRepository.insertLeafNode(file, destination);

    return file;
  }

  async stream(file: File): Promise<NodeJS.ReadableStream> {
    if (!file.hasCapabilities(Capabilities.CAN_STREAM) || !file.hash) {
      throw new FileIncapableException(Capabilities.CAN_STREAM);
    }

    return this.storageService.stream({ hash: file.hash });
  }

  @OnEvent("trash.deleted")
  private async handleTrashDeletion(file: File): Promise<void> {
    await this.fileRepository.removeSubtree(file.path);
  }

  @OnEvent("trash.emptied")
  private async handleTrashDepletion(owner: User): Promise<void> {
    const trashBin = await this.findTrashBin(owner);

    await this.fileRepository.removeDescendants(trashBin.path);
  }

  @OnEvent("trash.restored")
  private async handleTrashRestoration(file: File, originalParent?: File): Promise<void> {
    file.parent = originalParent ? Reference.create(originalParent) : undefined;

    await this.fileRepository.moveSubtree(
      file.path,
      originalParent ? originalParent.path : file.id
    );

    await this.fileRepository.persistAndFlush(file);
  }

  @OnEvent("user.created")
  private async handleUserCreation(user: User): Promise<void> {
    const capabilities =
      Capabilities.CAN_ADD_CHILDREN |
      Capabilities.CAN_LIST_CHILDREN |
      Capabilities.CAN_REMOVE_CHILDREN;

    const cabinet = new File();

    cabinet.capabilities = capabilities;
    cabinet.isCabinet = true;
    cabinet.name = "cabinet";
    cabinet.owner = user;
    cabinet.parent = undefined;

    await this.fileRepository.insertRootNode(cabinet);

    const trashBin = new File();

    trashBin.capabilities = capabilities;
    trashBin.isTrashBin = true;
    trashBin.name = "trash_bin";
    trashBin.owner = user;
    trashBin.parent = undefined;

    await this.fileRepository.insertRootNode(trashBin);
  }

  @OnEvent("user.deleted")
  private async handleUserDeletion(user: User): Promise<void> {
    const [cabinet, trashBin] = await Promise.all([
      this.findFileCabinet(user),
      this.findTrashBin(user)
    ]);

    await Promise.all([
      this.fileRepository.removeSubtree(cabinet.path),
      this.fileRepository.removeSubtree(trashBin.path)
    ]);
  }
}
