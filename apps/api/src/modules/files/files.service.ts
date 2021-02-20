import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";
import { IncomingMessage } from "http";
import { Readable } from "stream";

import { MultiparterOptions } from "@quicksend/multiparter";
import { settlePromises } from "@quicksend/utils";

import { FoldersService } from "../folders/folders.service";
import { ItemsService } from "../items/items.service";
import { StorageService } from "../storage/storage.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "./file.entity";
import { FolderEntity } from "../folders/folder.entity";
import { UserEntity } from "../user/user.entity";

import { CreateFile } from "./interfaces/create-file.interface";
import { UploadResults } from "./interfaces/upload-results.interface";

import {
  FileConflictException,
  FileDestinationNotFoundException,
  FileNotFoundException
} from "./file.exceptions";

@Injectable()
export class FilesService {
  constructor(
    private readonly folderService: FoldersService,
    private readonly itemsService: ItemsService,
    private readonly storageService: StorageService,
    private readonly uowService: UnitOfWorkService
  ) {}

  private get fileRepository() {
    return this.uowService.getRepository(FileEntity);
  }

  async copy(
    from: FindConditions<FileEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const source = await this.fileRepository.findOne(from);

    if (!source) {
      throw new FileNotFoundException();
    }

    const destination = await this.folderService.findOne(to);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: source.name,
      parent: destination,
      user: source.user
    });

    if (duplicate) {
      throw new FileConflictException(duplicate);
    }

    const copy = this.fileRepository.create({
      ...source,
      parent: destination
    });

    // don't use .save() here because it will always try to upsert
    await this.fileRepository.insert([copy]);

    return copy;
  }

  async create(payload: CreateFile): Promise<FileEntity> {
    const duplicate = await this.fileRepository.findOne(payload.file);

    if (duplicate) {
      throw new FileConflictException(duplicate);
    }

    const item = await this.itemsService.create(payload.item);

    const file = this.fileRepository.create({
      ...payload.file,
      item
    });

    return this.fileRepository.save(file);
  }

  async createDownloadStream(
    conditions: FindConditions<FileEntity>
  ): Promise<Readable> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new FileNotFoundException();
    }

    return this.storageService.read(file.item.discriminator);
  }

  async deleteOne(conditions: FindConditions<FileEntity>): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new FileNotFoundException();
    }

    await this.fileRepository.remove(file);

    const count = await this.fileRepository.count({
      item: file.item
    });

    // If there are no other files that reference the related item, then it should be deleted
    if (count === 0) {
      await this.itemsService.deleteOne({
        discriminator: file.item.discriminator
      });
    }

    return file;
  }

  async findOne(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity | undefined> {
    return this.fileRepository.findOne(conditions);
  }

  async findOneOrFail(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new FileNotFoundException();
    }

    return file;
  }

  async handleUpload(
    req: IncomingMessage,
    payload: {
      parent: string;
      user: UserEntity;
    },
    options?: Partial<MultiparterOptions>
  ): Promise<UploadResults> {
    const multiparter = await this.storageService.write(req, options);

    const results: UploadResults = {
      failed: [...multiparter.failed],
      succeeded: []
    };

    try {
      const parent = await this.folderService.findOne({
        id: payload.parent,
        user: payload.user
      });

      if (!parent) {
        throw new FileDestinationNotFoundException();
      }

      for (const item of multiparter.written) {
        try {
          const file = await this.create({
            file: {
              name: item.name,
              parent,
              user: payload.user
            },
            item
          });

          // If the item returned don't have matching discriminator, then this file is a duplicate
          if (file.item.discriminator !== item.discriminator) {
            await this.storageService.delete(item.discriminator);
          }

          results.succeeded.push(file);
        } catch (reason) {
          results.failed.push({
            file: item,
            reason
          });
        }
      }

      await settlePromises(
        results.failed
          .map((f) => () => this.storageService.delete(f.file.discriminator))
          .map((fn) => fn())
      );

      return results;
    } catch (error) {
      await multiparter.abort(error);

      throw error;
    }
  }

  async move(
    from: FindConditions<FileEntity>,
    to: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(from);

    if (!file) {
      throw new FileNotFoundException();
    }

    const destination = await this.folderService.findOne(to);

    if (!destination) {
      throw new FileDestinationNotFoundException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: file.name,
      parent: destination,
      user: file.user
    });

    if (duplicate) {
      throw new FileConflictException(duplicate);
    }

    file.parent = destination;

    return this.fileRepository.save(file);
  }

  async rename(
    conditions: FindConditions<FileEntity>,
    newName: string
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new FileNotFoundException();
    }

    const duplicate = await this.fileRepository.findOne({
      name: newName,
      parent: file.parent,
      user: file.user
    });

    if (duplicate) {
      throw new FileConflictException(duplicate);
    }

    file.name = newName;

    return this.fileRepository.save(file);
  }
}
