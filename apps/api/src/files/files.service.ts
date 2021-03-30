import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

import { File } from "@quicksend/transmit";
import { TransmitService } from "@quicksend/nestjs-transmit";

import { FindConditions } from "typeorm";

import { FoldersService } from "../folders/folders.service";
import { ItemsService } from "../items/items.service";
import { TransactionService } from "../transaction/transaction.service";
import { UserService } from "../user/user.service";

import { FileEntity } from "./file.entity";
import { FileInvitationEntity } from "./entities/file-invitation.entity";
import { FolderEntity } from "../folders/folder.entity";
import { UserEntity } from "../user/user.entity";

import { FileInvitationPrivilegeEnum } from "./enums/file-invitation-privilege.enum";

import {
  CantFindFileException,
  CantFindFileDestinationException,
  CantFindFileInvitationException,
  CantFindFileInvitee,
  FileConflictException,
  FileInviteeCannotBeOwner,
  InsufficientPrivilegesException
} from "./files.exceptions";

@Injectable()
export class FilesService {
  constructor(
    private readonly folderService: FoldersService,
    private readonly itemsService: ItemsService,
    private readonly transactionService: TransactionService,
    private readonly transmitService: TransmitService,
    private readonly userService: UserService
  ) {}

  private get fileRepository() {
    return this.transactionService.getRepository(FileEntity);
  }

  private get fileInvitationRepository() {
    return this.transactionService.getRepository(FileInvitationEntity);
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
      throw new CantFindFileDestinationException();
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
    conditions: FindConditions<FileEntity>,
    user: UserEntity
  ): Promise<NodeJS.ReadableStream> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    const hasPrivilege = await this.hasPrivilege(
      file,
      user,
      FileInvitationPrivilegeEnum.READ_ONLY
    );

    if (!hasPrivilege) {
      throw new InsufficientPrivilegesException();
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
   * Find a file or throw an error if it does not exist or if
   * the user does not have access
   */
  async findOneOrFail(
    conditions: FindConditions<FileEntity>,
    user: UserEntity
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    const hasPrivilege = await this.hasPrivilege(
      file,
      user,
      FileInvitationPrivilegeEnum.READ_ONLY
    );

    if (!hasPrivilege) {
      throw new InsufficientPrivilegesException();
    }

    return file;
  }

  /**
   * Checks whether a user has privilege to a file
   */
  async hasPrivilege(
    file: FileEntity,
    user: UserEntity,
    privilege: FileInvitationPrivilegeEnum
  ): Promise<boolean> {
    if (file.public || file.user.id === user.id) {
      return true;
    }

    const invitation = await this.fileInvitationRepository.findOne({
      invitee: user,
      file
    });

    if (!invitation || invitation.expired) {
      return false;
    }

    return invitation.privilege >= privilege;
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
      throw new CantFindFileDestinationException();
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
    isPublic: boolean,
    folderConditions: FindConditions<FolderEntity>
  ): Promise<FileEntity> {
    const parent = await this.folderService.findOne(folderConditions);

    if (!parent) {
      throw new CantFindFileDestinationException();
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
      public: isPublic,
      user: parent.user
    });

    return this.fileRepository.save(file);
  }

  async setPublicity(
    conditions: FindConditions<FileEntity>,
    isPublic: boolean
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(conditions);

    if (!file) {
      throw new CantFindFileException();
    }

    file.public = isPublic;

    return this.fileRepository.save(file);
  }

  /**
   * Invites a user to a file or updates the privilege of the
   * invitation if the user has already been invited
   */
  async share(
    fileConditions: FindConditions<FileEntity>,
    inviteeConditions: FindConditions<UserEntity>,
    privilege: FileInvitationPrivilegeEnum,
    expiresAt?: Date
  ): Promise<FileInvitationEntity> {
    const file = await this.fileRepository.findOne(fileConditions);

    if (!file) {
      throw new CantFindFileException();
    }

    const invitee = await this.userService.findOne(inviteeConditions);

    if (!invitee) {
      throw new CantFindFileInvitee();
    }

    if (file.user.id === invitee.id) {
      throw new FileInviteeCannotBeOwner();
    }

    const duplicate = await this.fileInvitationRepository.findOne({
      invitee,
      file
    });

    // Update the invitation if the user is already invited to this file
    if (duplicate) {
      duplicate.expiresAt = expiresAt || null;
      duplicate.privilege = privilege;

      return this.fileInvitationRepository.save(duplicate);
    }

    const invitation = this.fileInvitationRepository.create({
      expiresAt,
      invitee,
      file,
      privilege
    });

    return this.fileInvitationRepository.save(invitation);
  }

  /**
   * Delete a invitee if specified, otherwise removes all invitees for this file
   */
  async unshare(
    fileConditions: FindConditions<FileEntity>,
    inviteeConditions: FindConditions<UserEntity>
  ): Promise<FileInvitationEntity> {
    const file = await this.fileRepository.findOne(fileConditions);

    if (!file) {
      throw new CantFindFileException();
    }

    const invitee = await this.userService.findOne(inviteeConditions);

    if (!invitee) {
      throw new CantFindFileInvitee();
    }

    const invitation = await this.fileInvitationRepository.findOne({
      invitee,
      file
    });

    if (!invitation) {
      throw new CantFindFileInvitationException();
    }

    return this.fileInvitationRepository.remove(invitation);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredInvitations(): Promise<void> {
    await this.fileInvitationRepository
      .createQueryBuilder()
      .delete()
      .where("now() >= expiresAt")
      .execute();
  }
}
