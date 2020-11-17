import { Inject, Injectable, forwardRef } from "@nestjs/common";

import { FindConditions, FindOneOptions } from "typeorm";
import { IncomingMessage } from "http";

import { config } from "@quicksend/config";

import {
  DiskStorageEngine,
  FailedFile,
  IncomingFile,
  Multiparter,
  MultiparterOptions,
  StorageEngine
} from "@quicksend/multiparter";

import { FolderService } from "../folder/folder.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "./entities/file.entity";
import { ItemEntity } from "./entities/item.entity";
import { UserEntity } from "../user/entities/user.entity";

import { FileAlreadyExists, FileNotFound } from "./file.exceptions";
import { ParentFolderNotFound } from "../folder/folder.exception";

import { UploadResultsDto } from "./dto/upload-results.dto";

@Injectable()
export class FileService {
  private readonly engine: StorageEngine;

  constructor(
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly uowService: UnitOfWorkService
  ) {
    const { engine, options } = config.get("storage");

    switch (engine) {
      case "disk":
        this.engine = new DiskStorageEngine(options);
        break;

      default:
        this.engine = new DiskStorageEngine(options);
    }
  }

  get fileRepository() {
    return this.uowService.getRepository(FileEntity);
  }

  get itemRepository() {
    return this.uowService.getRepository(ItemEntity);
  }

  async deleteOne(conditions: FindConditions<FileEntity>): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);
    if (!file) throw new FileNotFound();

    await this.fileRepository.delete({ id: file.id });

    const count = await this.fileRepository.count({
      take: 1,
      where: {
        item: file.item
      }
    });

    if (count === 0) {
      await this.itemRepository.delete({ id: file.item.id });
      await this.engine.delete(file.item.discriminator);
    }

    return file;
  }

  findOne(
    conditions: FindConditions<FileEntity>
  ): Promise<FileEntity | undefined> {
    return this.fileRepository.findOne(conditions);
  }

  findOneByQuery(
    options: FindOneOptions<FileEntity>
  ): Promise<FileEntity | undefined> {
    return this.fileRepository.findOne(options);
  }

  async handleUpload(
    req: IncomingMessage,
    payload: {
      parent?: string | null;
      user: UserEntity;
    },
    options?: MultiparterOptions
  ): Promise<UploadResultsDto> {
    const multiparter = await new Multiparter(
      options || {
        busboy: {
          limits: config.get("storage").limits
        },
        engine: this.engine,
        field: "file"
      }
    ).parse(req);

    const failed: FailedFile[] = [...multiparter.failed];
    const succeeded: FileEntity[] = [];

    try {
      const parent = await this.folderService.findOne(
        payload.parent
          ? { id: payload.parent, user: payload.user }
          : { isRoot: true, user: payload.user }
      );

      if (!parent) {
        throw new ParentFolderNotFound();
      }

      for (const itemWritten of multiparter.succeeded) {
        const file = this.fileRepository.create({
          name: itemWritten.filename,
          parent,
          user: payload.user
        });

        const conflict =
          (await this.fileRepository.findOne(file)) ||
          (await this.folderService.findOne(file));

        if (conflict) {
          failed.push({
            error: new FileAlreadyExists(file.name, parent.name).message,
            file: multiparter.files.find(
              (file) => file.discriminator === itemWritten.discriminator
            ) as IncomingFile
          });

          await this.engine.delete(itemWritten.discriminator);
        } else {
          // prettier-ignore
          const item =
            (await this.itemRepository.findOne({ hash: itemWritten.hash })) ||
            (await this.itemRepository.save(this.itemRepository.create(itemWritten)));

          // If the discriminators don't match, it means that this file is a duplicate
          if (item.discriminator !== itemWritten.discriminator) {
            await this.engine.delete(itemWritten.discriminator);
          }

          await this.fileRepository
            .save({ ...file, item })
            .then((f) => succeeded.push(f));
        }
      }

      await Promise.all(
        failed
          .map((fail) => () => this.engine.delete(fail.file.discriminator))
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
