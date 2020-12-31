import { Inject, Injectable, forwardRef } from "@nestjs/common";

import { FindConditions } from "typeorm";
import { IncomingMessage } from "http";
import { Readable } from "stream";

import { FailedFile, MultiparterOptions } from "@quicksend/multiparter";

import { FolderService } from "../folder/folder.service";
import { ItemService } from "../item/item.service";
import { StorageService } from "../storage/storage.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "./file.entity";
import { UserEntity } from "../user/user.entity";

import { UploadResults } from "./interfaces/upload-results.interface";

import {
  FileAlreadyExistsException,
  FileIsGhostedException,
  FileNotFoundException
} from "./file.exceptions";

import { ParentFolderNotFoundException } from "../folder/folder.exceptions";

import { settlePromises } from "@quicksend/utils";

@Injectable()
export class FileService {
  constructor(
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly itemService: ItemService,
    private readonly storageService: StorageService,
    private readonly uowService: UnitOfWorkService
  ) {}

  private get fileRepository() {
    return this.uowService.getRepository(FileEntity);
  }

  async createDownloadStream(
    conditions: FindConditions<FileEntity>
  ): Promise<Readable> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) throw new FileNotFoundException();
    if (!file.item) throw new FileIsGhostedException("download");

    return this.storageService.read(file.item.discriminator);
  }

  async deleteOne(conditions: FindConditions<FileEntity>): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);
    if (!file) throw new FileNotFoundException();

    await this.fileRepository.remove(file);

    if (file.item) {
      const count = await this.fileRepository.count({
        take: 1,
        where: {
          item: file.item.id
        }
      });

      // If there are no other files that reference the related item, then it should be deleted
      if (count === 0) {
        await this.itemService.deleteOne({
          discriminator: file.item.discriminator
        });
      }
    }

    return file;
  }

  findOne(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity | undefined> {
    return this.fileRepository.findOne(conditions);
  }

  async handleUpload(
    req: IncomingMessage,
    payload: {
      parent: string | null;
      user: UserEntity;
    },
    options?: Partial<MultiparterOptions>
  ): Promise<UploadResults> {
    const multiparter = await this.storageService.write(req, options);

    const failed: FailedFile[] = [...multiparter.failed];
    const succeeded: FileEntity[] = [];

    try {
      const parent = await this.folderService.findOne(
        payload.parent
          ? { id: payload.parent, user: payload.user }
          : { isRoot: true, user: payload.user }
      );

      if (!parent) {
        throw new ParentFolderNotFoundException();
      }

      for (const fileWritten of multiparter.succeeded) {
        const file = this.fileRepository.create({
          name: fileWritten.filename,
          parent,
          user: payload.user
        });

        const filenameConflict =
          (await this.fileRepository.findOne(file)) ||
          (await this.folderService.findOne(file));

        if (filenameConflict) {
          failed.push({
            error: new FileAlreadyExistsException(file.name, parent.name),
            file: fileWritten
          });

          await this.storageService.delete(fileWritten.discriminator);

          continue;
        }

        const item = await this.itemService.create({
          discriminator: fileWritten.discriminator,
          hash: fileWritten.hash as string, // Any file written to storage engine will always have a hash
          size: fileWritten.size
        });

        file.item = item;

        await this.fileRepository.save(file);

        // If the item returned don't have matching discriminator, then this file is a duplicate
        if (item.discriminator !== fileWritten.discriminator) {
          await this.storageService.delete(fileWritten.discriminator);
        }

        succeeded.push(file);
      }

      await settlePromises(
        failed
          .map((f) => () => this.storageService.delete(f.file.discriminator))
          .map((fn) => fn())
      );
    } catch (error) {
      await multiparter.abort(error);

      throw error;
    }

    return {
      failed,
      succeeded
    };
  }
}
