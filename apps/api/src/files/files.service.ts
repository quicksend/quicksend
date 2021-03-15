import { Injectable } from "@nestjs/common";

import { File } from "@quicksend/transmit";
import { TransmitService } from "@quicksend/nestjs-transmit";

import { FindConditions } from "typeorm";

import { FoldersService } from "../folders/folders.service";
import { ItemsService } from "../items/items.service";
import { TransactionService } from "../transaction/transaction.service";

import { FileEntity } from "./file.entity";
import { FolderEntity } from "../folders/folder.entity";

import {
  CantFindFileException,
  FileConflictException
} from "./files.exceptions";

import { CantFindDestinationFolderException } from "../folders/folders.exceptions";

@Injectable()
export class FilesService {
  constructor(
    private readonly folderService: FoldersService,
    private readonly itemsService: ItemsService,
    private readonly transactionService: TransactionService,
    private readonly transmitService: TransmitService
  ) {}

  private get fileRepository() {
    return this.transactionService.getRepository(FileEntity);
  }

  /**
   * Create a copy of the file to a new destination
   */
  async copy(
    from: FindConditions<FileEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const source = await this.fileRepository.findOne(from);

    if (!source) {
      throw new CantFindFileException();
    }

    const destination = await this.folderService.findOne(to);

    if (!destination) {
      throw new CantFindDestinationFolderException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parent: destination,
      user: source.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const copy = this.fileRepository.create({
      ...source,
      parent: destination
    });

    // don't use .save() here because it will always try to upsert
    await this.fileRepository.insert([copy]);

    return copy;
  }

  /**
   * Find a file and returns a readable stream from item service
   */
  async createReadableStream(
    conditions: FindConditions<FileEntity>
  ): Promise<NodeJS.ReadableStream> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    return this.itemsService.createReadableStream({
      id: file.item.id
    });
  }

  /**
   * Delete a file from the database and place the physical file onto the deletion queue
   * if it has no other references
   */
  async deleteOne(conditions: FindConditions<FileEntity>): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    await this.fileRepository.remove(file);

    const count = await this.fileRepository.count({
      item: file.item
    });

    // If there are no other files that reference the related item, then it should be deleted
    if (count === 0) {
      await this.itemsService.deleteOne({
        id: file.item.id
      });
    }

    return file;
  }

  /**
   * Find a file or returns undefined if it does not exist
   */
  async findOne(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity | undefined> {
    return this.fileRepository.findOne(conditions);
  }

  /**
   * Find a file or throws an error if it does not exist
   */
  async findOneOrFail(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    return file;
  }

  /**
   * Move a file to another folder
   */
  async move(
    from: FindConditions<FileEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(from);

    if (!file) {
      throw new CantFindFileException();
    }

    const destination = await this.folderService.findOne(to);

    if (!destination) {
      throw new CantFindDestinationFolderException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: file.name,
      parent: destination,
      user: file.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    file.parent = destination;

    return this.fileRepository.save(file);
  }

  /**
   * Rename a file with a new name
   */
  async rename(
    conditions: FindConditions<FileEntity>,
    newName: string
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: newName,
      parent: file.parent,
      user: file.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    file.name = newName;

    return this.fileRepository.save(file);
  }

  /**
   * Saves the metadata of an uploaded file and create its associated item if it does not exist
   */
  async save(
    metadata: File,
    folderConditions: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const parent = await this.folderService.findOne(folderConditions);

    if (!parent) {
      throw new CantFindDestinationFolderException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: metadata.name,
      parent,
      user: parent.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const item = await this.itemsService.grabOne(
      metadata.discriminator,
      metadata.hash,
      metadata.size
    );

    // If the grabbed item discriminator doesn't match with the discriminator of the uploaded file,
    // it means that the item already exist, therefore we need to deduplicate by deleting the uploaded file.
    if (item.discriminator !== metadata.discriminator) {
      await this.transmitService.deleteFile(metadata);
    }

    const file = this.fileRepository.create({
      name: metadata.name,
      item,
      parent,
      user: parent.user
    });

    return this.fileRepository.save(file);
  }
}
