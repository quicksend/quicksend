import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { FilterQuery, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { InvitationPrivileges } from "@quicksend/types";
import { LTreeRepository } from "@quicksend/common";

import { FilesService } from "../files/files.service";

import { File } from "../files/entities/file.entity";
import { Invitation } from "./entities/invitation.entity";

import { CreateInvitationPayload } from "./payloads/create-invitation.payload";

import {
  InvitationConflictException,
  InvitationNotFoundException,
  InviteeCannotBeOwnerException,
  InviteeCannotBeSelfException
} from "./invitations.exceptions";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly filesService: FilesService,

    @InjectRepository(Invitation)
    private readonly invitationRepository: LTreeRepository<Invitation>
  ) {}

  async create(payload: CreateInvitationPayload): Promise<Invitation> {
    const file = await this.filesService.findOne(payload.path);

    const duplicate = await this.invitationRepository.findOne({
      invitee: payload.invitee,
      path: file.path
    });

    if (duplicate) {
      throw new InvitationConflictException();
    }

    if (payload.invitee === file.owner) {
      throw new InviteeCannotBeOwnerException();
    }

    if (payload.invitee === payload.inviter) {
      throw new InviteeCannotBeSelfException();
    }

    const invitation = new Invitation();

    invitation.expiresAt = payload.expiresAt;
    invitation.invitee = payload.invitee;
    invitation.inviter = payload.inviter;
    invitation.path = file.path;
    invitation.setPrivileges(
      ...payload.privileges.map((privilege) => InvitationPrivileges[privilege])
    );

    await this.invitationRepository.persistAndFlush(invitation);

    return invitation;
  }

  async deleteOne(filter: FilterQuery<Invitation>, removeDescendants = false): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne(filter);

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (removeDescendants) {
      await this.invitationRepository.removeDescendants(invitation.path);
    }

    await this.invitationRepository.removeAndFlush(invitation);

    return invitation;
  }

  async findClosestAncestor(path: string, filter?: FilterQuery<Invitation>): Promise<Invitation> {
    const invitation = await this.invitationRepository.findClosestAncestor(path, filter);

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    return invitation;
  }

  async findOne(filter: FilterQuery<Invitation>): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne(filter);

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    return invitation;
  }

  async list(
    filter: FilterQuery<Invitation>,
    limit: number,
    after?: string
  ): Promise<Invitation[]> {
    const query: FilterQuery<Invitation> = {};

    if (after) {
      query.id = {
        $gt: after
      };
    }

    return this.invitationRepository.find(query, {
      limit,
      orderBy: {
        id: QueryOrder.ASC
      }
    });
  }

  async updateOne(
    filter: FilterQuery<Invitation>,
    expiresAt?: number,
    privileges?: Array<keyof typeof InvitationPrivileges>
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne(filter);

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (expiresAt) {
      invitation.expiresAt = expiresAt;
    }

    if (privileges) {
      invitation.setPrivileges(...privileges.map((privilege) => InvitationPrivileges[privilege]));
    }

    await this.invitationRepository.persistAndFlush(invitation);

    return invitation;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredInvitations(): Promise<void> {
    await this.invitationRepository.nativeDelete({
      expiresAt: {
        $lte: Date.now()
      }
    });
  }

  @OnEvent(FilesEvents.FILE_DELETED)
  private async handleFileDeletion(file: File): Promise<void> {
    await this.invitationRepository.removeSubtree(file.path);
  }

  @OnEvent(FilesEvents.FILE_MOVED)
  private async handleFileRelocation(source: File, destination: File): Promise<void> {
    await this.invitationRepository.moveSubtree(source.path, destination.path);
  }

  @OnEvent(FilesEvents.TRASH_BIN_EMPTIED)
  private async handleTrashDepletion(trashBin: File): Promise<void> {
    await this.invitationRepository.removeSubtree(trashBin.path);
  }

  @OnEvent(UserEvents.USER_DELETED)
  private async handleUserDeletion(user: User): Promise<void> {
    await this.invitationRepository.nativeDelete({
      $or: [{ invitee: user.id }, { inviter: user.id }]
    });
  }
}
