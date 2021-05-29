import { Injectable, PipeTransform, Type, mixin } from "@nestjs/common";

import { RequestContext } from "../../common/contexts/request.context";

import { Privileges } from "../../sharing/enums/privileges.enum";

import { SharingService } from "../../sharing/sharing.service";

import { Invitation } from "../entities/invitation.entity";

import {
  InsufficientPrivilegesException,
  InvitationNotFoundException
} from "../sharing.exceptions";

export const InvitationByIdPipe = (...privileges: Privileges[]): Type<PipeTransform> => {
  @Injectable()
  class InvitationByIdMixinPipe implements PipeTransform {
    constructor(private readonly sharingService: SharingService) {}

    async transform(id: string): Promise<Invitation> {
      const invitation = await this.sharingService.findOne({ id });

      if (!invitation) {
        throw new InvitationNotFoundException();
      }

      const user = RequestContext.getItem("user");

      // File owners always have full access to the invitations
      if (user && invitation.file.owner.id === user.id) {
        return invitation;
      }

      // Try to find the closest ancestor with an invitation for the user with the specified privileges
      const hasSufficientPrivileges = await this.sharingService.hasPrivileges({
        path: invitation.path,
        privileges,
        user
      });

      if (!hasSufficientPrivileges) {
        throw new InsufficientPrivilegesException(...privileges);
      }

      return invitation;
    }
  }

  return mixin(InvitationByIdMixinPipe);
};
