import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { PassThrough } from "stream";

import { Config } from "../common/config/config.interface";

import { Counter } from "../common/utils/counter.util";

import { FoldersService } from "../folders/folders.service";
import { MailerService } from "../mailer/mailer.service";
import { RepositoriesService } from "../repositories/repositories.service";
import { StorageService } from "../storage/storage.service";
import { UserService } from "../user/user.service";

import { PhysicalFile } from "./entities/physical-file.entity";
import { VirtualFile } from "./entities/virtual-file.entity";
import { VirtualFileInvitation } from "./entities/virtual-file-invitation.entity";

import { VirtualFileInvitationPrivileges } from "./enums/virtual-file-invitation-privilege.enum";

import { CreatePhysicalFileResult } from "./interfaces/create-physical-file-result.interface";

import { CheckFilePrivilegesPayload } from "./payloads/check-file-privileges.payload";
import { CopyFilePayload } from "./payloads/copy-file.payload";
import { CreatePhysicalFilePayload } from "./payloads/create-physical-file.payload";
import { CreateReadableStreamPayload } from "./payloads/create-readable-stream.payload";
import { FindFilePayload } from "./payloads/find-file.payload";
import { MoveFilePayload } from "./payloads/move-file.payload";
import { RenameFilePayload } from "./payloads/rename-file.payload";
import { SaveFilePayload } from "./payloads/save-file.payload";
import { ShareFilePayload } from "./payloads/share-file.payload";
import { UnshareFilePayload } from "./payloads/unshare-file.payload";

import {
  CantFindFileException,
  CantFindFileDestinationException,
  CantFindFileInvitationException,
  CantFindFileInvitee,
  FileConflictException,
  FileInviteeCannotBeOwner,
  FileInviteeCannotBeSelf,
  InsufficientPrivilegesException
} from "./files.exceptions";

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly foldersService: FoldersService,
    private readonly mailerService: MailerService,
    private readonly repositoriesService: RepositoriesService,
    private readonly storageService: StorageService,
    private readonly userService: UserService
  ) {}

  private get physicalFileRepository(): EntityRepository<PhysicalFile> {
    return this.repositoriesService.getRepository(PhysicalFile);
  }

  private get virtualFileRepository(): EntityRepository<VirtualFile> {
    return this.repositoriesService.getRepository(VirtualFile);
  }

  private get virtualFileInvitationRepository(): EntityRepository<VirtualFileInvitation> {
    return this.repositoriesService.getRepository(VirtualFileInvitation);
  }

  /**
   * Checks whether a user has privilege to a file
   */
  async checkFilePrivileges(payload: CheckFilePrivilegesPayload): Promise<boolean> {
    const { file, privileges, user } = payload;

    if (user && file.user.id === user.id) {
      return true;
    }

    const invitation = await this.virtualFileInvitationRepository.findOne({
      file,
      invitee: user
    });

    if (!invitation || invitation.expired) {
      return false;
    }

    for (const privilege of privileges) {
      if (!invitation.privileges.includes(privilege)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a copy of a virtual file to a new destination
   */
  async copy(payload: CopyFilePayload): Promise<VirtualFile> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.source);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: virtualFile,
      privileges: [VirtualFileInvitationPrivileges.CAN_CREATE_COPY],
      user: payload.user
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    const destination = await this.foldersService.findOne(payload.destination);

    if (!destination) {
      throw new CantFindFileDestinationException();
    }

    const duplicate = await this.virtualFileRepository.findOne({
      name: virtualFile.name,
      parent: destination,
      user: payload.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const copy = this.virtualFileRepository.create({
      ...virtualFile,
      parent: destination
    });

    await this.virtualFileRepository.persistAndFlush(copy);

    return copy;
  }

  /**
   * Create a readable stream for the physical file of the virtual file.
   */
  async createReadableStream(payload: CreateReadableStreamPayload): Promise<NodeJS.ReadableStream> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.file);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: virtualFile,
      privileges: [VirtualFileInvitationPrivileges.CAN_DOWNLOAD],
      user: payload.user
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    return this.storageService.createReadableStream(virtualFile.metadata.discriminator);
  }

  /**
   * Delete a virtual file permanently and place the physical file onto the deletion queue
   */
  async deletePermanently(conditions: FilterQuery<VirtualFile>): Promise<VirtualFile> {
    const virtualFile = await this.virtualFileRepository.findOne(conditions);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    await this.virtualFileRepository.removeAndFlush(virtualFile);

    const count = await this.physicalFileRepository.count({
      id: virtualFile.metadata.id
    });

    // Delete physical file if there are no other virtual files that reference it
    if (count === 0) {
      await this.deletePhysicalFile(virtualFile.metadata);
    }

    return virtualFile;
  }

  /**
   * Find a virtual file or returns null if it does not exist
   */
  async findOne(conditions: FilterQuery<VirtualFile>): Promise<VirtualFile | null> {
    return this.virtualFileRepository.findOne(conditions);
  }

  /**
   * Find a virtual file or throw an error if it does not exist or if the user does not have access
   */
  async findOneOrFail(payload: FindFilePayload): Promise<VirtualFile> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.file);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: virtualFile,
      privileges: [],
      user: payload.user
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    return virtualFile;
  }

  /**
   * Move a file to another folder
   */
  async move(payload: MoveFilePayload): Promise<VirtualFile> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.source);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const destination = await this.foldersService.findOne(payload.destination);

    if (!destination) {
      throw new CantFindFileDestinationException();
    }

    const duplicate = await this.virtualFileRepository.findOne({
      name: virtualFile.name,
      parent: destination,
      user: virtualFile.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    virtualFile.parent = destination;

    await this.virtualFileRepository.persistAndFlush(virtualFile);

    return virtualFile;
  }

  /**
   * Rename a file with a new name
   */
  async rename(payload: RenameFilePayload): Promise<VirtualFile> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.file);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: virtualFile,
      privileges: [VirtualFileInvitationPrivileges.CAN_RENAME],
      user: payload.user
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    const duplicate = await this.virtualFileRepository.findOne({
      name: payload.name,
      parent: virtualFile.parent,
      user: virtualFile.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    virtualFile.name = payload.name;

    await this.virtualFileRepository.persistAndFlush(virtualFile);

    return virtualFile;
  }

  /**
   * Saves the metadata of an uploaded file and create its associated item if it does not exist
   */
  async save(payload: SaveFilePayload): Promise<VirtualFile> {
    const parent = await this.foldersService.findOne(payload.folder);

    if (!parent) {
      throw new CantFindFileDestinationException();
    }

    const duplicate = await this.virtualFileRepository.findOne({
      name: payload.metadata.name,
      parent,
      user: parent.user
    });

    if (duplicate) {
      throw new FileConflictException();
    }

    const { isNew, physicalFile } = await this.createPhysicalFile(payload.metadata);

    // If the physical file already exists, delete the one that was just uploaded
    if (!isNew) {
      await this.storageService.deleteByFilename(payload.metadata.discriminator);
    }

    const virtualFile = this.virtualFileRepository.create({
      metadata: physicalFile,
      name: payload.metadata.name,
      parent,
      user: parent.user
    });

    await this.virtualFileRepository.persistAndFlush(virtualFile);

    if (payload.isPublic) {
      const invitation = this.virtualFileInvitationRepository.create({
        file: virtualFile,
        invitee: null,
        inviter: parent.user,
        privileges: [
          VirtualFileInvitationPrivileges.CAN_CREATE_COPY,
          VirtualFileInvitationPrivileges.CAN_DOWNLOAD
        ]
      });

      await this.virtualFileInvitationRepository.persistAndFlush(invitation);
    }

    return virtualFile;
  }

  /**
   * Invites a user to a file or updates the invitation if the user has already been invited
   */
  async share(payload: ShareFilePayload): Promise<VirtualFileInvitation> {
    const virtualFile = await this.virtualFileRepository.findOne(payload.file);

    if (!virtualFile) {
      throw new CantFindFileException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: virtualFile,
      privileges: [VirtualFileInvitationPrivileges.CAN_SHARE],
      user: payload.inviter
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    if (!payload.invitee) {
      const duplicate = await this.virtualFileInvitationRepository.findOne({
        file: virtualFile,
        invitee: null
      });

      if (duplicate) {
        duplicate.expiresAt = payload.expiresAt;
        duplicate.privileges = payload.privileges;

        await this.virtualFileInvitationRepository.persistAndFlush(duplicate);

        return duplicate;
      }

      const invitation = this.virtualFileInvitationRepository.create({
        expiresAt: payload.expiresAt,
        file: virtualFile,
        invitee: null,
        inviter: payload.inviter,
        privilege: payload.privileges
      });

      await this.virtualFileInvitationRepository.persistAndFlush(invitation);

      return invitation;
    }

    const invitee = await this.userService.findOne(payload.invitee);

    if (!invitee) {
      throw new CantFindFileInvitee();
    }

    if (virtualFile.user.id === invitee.id) {
      throw new FileInviteeCannotBeOwner();
    }

    if (payload.inviter.id === invitee.id) {
      throw new FileInviteeCannotBeSelf();
    }

    const duplicate = await this.virtualFileInvitationRepository.findOne({
      file: virtualFile,
      invitee
    });

    if (duplicate) {
      duplicate.expiresAt = payload.expiresAt;
      duplicate.privileges = payload.privileges;

      await this.virtualFileInvitationRepository.persistAndFlush(duplicate);

      return duplicate;
    }

    const invitation = this.virtualFileInvitationRepository.create({
      expiresAt: payload.expiresAt,
      file: virtualFile,
      invitee,
      inviter: payload.inviter,
      privileges: payload.privileges
    });

    await this.virtualFileInvitationRepository.persistAndFlush(invitation);

    if (payload.notifyInvitee) {
      await this.notifyFileInvitee(invitation, payload.message);
    }

    return invitation;
  }

  /**
   * Delete a file invitation
   */
  async unshare(payload: UnshareFilePayload): Promise<VirtualFileInvitation> {
    const invitation = await this.virtualFileInvitationRepository.findOne(payload.invitation);

    if (!invitation) {
      throw new CantFindFileInvitationException();
    }

    const sufficientPrivileges = await this.checkFilePrivileges({
      file: invitation.file,
      privileges: [VirtualFileInvitationPrivileges.CAN_UNSHARE],
      user: payload.user
    });

    if (!sufficientPrivileges) {
      throw new InsufficientPrivilegesException();
    }

    await this.virtualFileInvitationRepository.removeAndFlush(invitation);

    return invitation;
  }

  private async createPhysicalFile(
    payload: CreatePhysicalFilePayload
  ): Promise<CreatePhysicalFileResult> {
    const duplicate = await this.physicalFileRepository.findOne({
      hash: payload.hash
    });

    if (duplicate) {
      return {
        isNew: false,
        physicalFile: duplicate
      };
    }

    const physicalFile = this.physicalFileRepository.create(payload);

    await this.physicalFileRepository.persistAndFlush(physicalFile);

    return {
      isNew: true,
      physicalFile
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredInvitations(): Promise<void> {
    await this.virtualFileInvitationRepository.nativeDelete({
      expiresAt: {
        $lte: "now()"
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteOrphanedPhysicalFiles(): Promise<void> {
    const { limit } = this.configService.get("purge") as Config["purge"];

    const orphans = this.getOrphanedPhysicalFiles(limit);

    return new Promise((resolve, reject) => {
      const pendingDeletes = new Counter();

      orphans.on("data", (orphan: PhysicalFile) => {
        pendingDeletes.increment();

        this.deletePhysicalFile(orphan)
          .then(() => pendingDeletes.decrement())
          .catch((error) => reject(error));
      });

      orphans.once("end", () => pendingDeletes.onceItEqualsTo(0, resolve));
      orphans.once("error", (error) => reject(error));
    });
  }

  private async deletePhysicalFile(physicalFile: PhysicalFile): Promise<void> {
    await this.physicalFileRepository.nativeDelete({
      id: physicalFile.id
    });

    await this.storageService.deleteByFilename(physicalFile.discriminator);
  }

  private getOrphanedPhysicalFiles(limit: number): PassThrough {
    const knex = this.physicalFileRepository.getKnex();

    return knex
      .select()
      .from("physical_file")
      .whereNotExists(
        knex
          .select("metadata_id")
          .from("virtual_file")
          .where("metadata_id", knex.ref("physical_file.id"))
      )
      .limit(limit)
      .stream();
  }

  private async notifyFileInvitee(
    invitation: VirtualFileInvitation,
    message?: string
  ): Promise<void> {
    if (!invitation.invitee) {
      return;
    }

    return this.mailerService.renderAndSend(
      "file-invitation",
      {
        subject: `${invitation.inviter.username} shared "${invitation.file.name}" with you.`,
        to: invitation.invitee.email
      },
      {
        filename: invitation.file.name,
        inviter: invitation.inviter.username,
        message: message || `Here's the file that ${invitation.inviter.username} shared with you.`,
        url: this.mailerService.buildURL(`/files/${invitation.file.id}`),
        username: invitation.invitee.username
      }
    );
  }
}
