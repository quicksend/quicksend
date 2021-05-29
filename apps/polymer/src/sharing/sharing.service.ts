import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { FilterQuery } from "@mikro-orm/core";

import { LTreeRepository } from "../common/repositories/ltree.repository";

import { MailerService } from "../mailer/mailer.service";
import { RepositoriesService } from "../repositories/repositories.service";

import { Capabilities } from "../files/enums/capabilities.enum";
import { Privileges } from "./enums/privileges.enum";

import { File } from "../files/entities/file.entity";
import { Invitation } from "./entities/invitation.entity";
import { User } from "../user/entities/user.entity";

import { CheckPrivilegesPayload } from "./payloads/check-privileges.payload";
import { CreateInvitationPayload } from "./payloads/create-invitation.payload";

import {
  InvitationConflictException,
  InviteeCannotBeOwnerException,
  InviteeCannotBeSelfException
} from "./sharing.exceptions";

@Injectable()
export class SharingService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly repositoriesService: RepositoriesService
  ) {}

  private get invitationRepository(): LTreeRepository<Invitation> {
    return this.repositoriesService.getRepository(Invitation);
  }

  async create(payload: CreateInvitationPayload): Promise<Invitation> {
    const duplicate = await this.invitationRepository.findOne({
      invitee: payload.invitee,
      path: payload.file.path
    });

    if (duplicate) {
      throw new InvitationConflictException();
    }

    if (payload.invitee?.id === payload.file.owner.id) {
      throw new InviteeCannotBeOwnerException();
    }

    if (payload.invitee?.id === payload.inviter.id) {
      throw new InviteeCannotBeSelfException();
    }

    const invitation = new Invitation();

    invitation.expiresAt = payload.expiresAt;
    invitation.invitee = payload.invitee;
    invitation.inviter = payload.inviter;
    invitation.path = payload.file.path;
    invitation.setPrivileges(...payload.privileges.map((privilege) => Privileges[privilege]));

    await this.invitationRepository.persistAndFlush(invitation);

    await this.notifyInvitee(payload.file, invitation, payload.message);

    return invitation;
  }

  async deleteOne(invitation: Invitation, removeDescendants = false): Promise<Invitation> {
    if (removeDescendants) {
      await this.invitationRepository.removeDescendants(invitation.path);
    }

    await this.invitationRepository.removeAndFlush(invitation);

    return invitation;
  }

  async findOne(filter: FilterQuery<Invitation>): Promise<Invitation | null> {
    return this.invitationRepository.findOne(filter);
  }

  async hasPrivileges(payload: CheckPrivilegesPayload): Promise<boolean> {
    // Try to find the closest ancestor with an invitation for the user
    const invitation = await this.invitationRepository.findClosestAncestor(payload.path, {
      invitee: payload.user
    });

    if (!invitation) {
      return false;
    }

    return invitation.hasPrivileges(...payload.privileges);
  }

  async updateOne(
    invitation: Invitation,
    expiresAt?: Date,
    privileges?: Array<keyof typeof Privileges>
  ): Promise<Invitation> {
    if (expiresAt) {
      invitation.expiresAt = expiresAt;
    }

    if (privileges) {
      invitation.setPrivileges(...privileges.map((privilege) => Privileges[privilege]));
    }

    await this.invitationRepository.persistAndFlush(invitation);

    return invitation;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredInvitations(): Promise<void> {
    await this.invitationRepository.nativeDelete({
      expiresAt: {
        $lte: new Date()
      }
    });
  }

  @OnEvent("file.moved")
  private async handleFileRelocation(source: File, destination: File): Promise<void> {
    await this.invitationRepository.moveSubtree(source.path, destination.path);
  }

  @OnEvent("trash.deleted")
  private async handleTrashDeletion(file: File): Promise<void> {
    await this.invitationRepository.removeSubtree(file.path);
  }

  @OnEvent("user.deleted")
  private async handleUserDeletion(user: User): Promise<void> {
    await this.invitationRepository.nativeDelete({
      $or: [{ invitee: user }, { inviter: user }]
    });
  }

  private async notifyInvitee(file: File, invitation: Invitation, message?: string): Promise<void> {
    const { invitee, inviter } = invitation;

    if (invitee?.email) {
      const isFolder = file.hasCapabilities(
        Capabilities.CAN_ADD_CHILDREN,
        Capabilities.CAN_LIST_CHILDREN,
        Capabilities.CAN_REMOVE_CHILDREN
      );

      const type = isFolder ? "folder" : "file";

      await this.mailerService.renderAndSend(
        "file-invitation",
        {
          subject: `${inviter.username} shared "${file.name}" with you.`,
          to: invitee.email
        },
        {
          filename: file.name,
          inviter: inviter.username,
          message: message || `Here's the ${type} that ${inviter.username} shared with you.`,
          type,
          url: this.mailerService.buildURL(`/files/${file.id}`),
          username: invitee.username
        }
      );
    }
  }
}
