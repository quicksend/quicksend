import { Controller, UseFilters } from "@nestjs/common";
import { Payload } from "@nestjs/microservices";

import { InvitationsExceptionFilter } from "./invitations.filter";
import { InvitationsService } from "./invitations.service";

import { Invitation } from "./entities/invitation.entity";

import { CreateInvitationPayload } from "./payloads/create-invitation.payload";
import { DeleteInvitationPayload } from "./payloads/delete-invitation.payload";
import { FindInvitationPayload } from "./payloads/find-invitation.payload";
import { UpdateInvitationPayload } from "./payloads/update-invitation.payload";

@Controller()
@UseFilters(InvitationsExceptionFilter)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  create(@Payload() payload: CreateInvitationPayload): Promise<Invitation> {
    return this.invitationsService.create({
      ...payload,
      file,
      invitee,
      inviter
    });
  }

  deleteOne(@Payload() payload: DeleteInvitationPayload): Promise<Invitation> {
    return this.invitationsService.deleteOne(payload.invitation, payload.removeDescendants);
  }

  findClosestByPath(@Payload() payload): Promise<Invitation> {
    return this.invitationsService.findClosestAncestor();
  }

  findOne(@Payload() payload: FindInvitationPayload): Promise<Invitation> {
    return this.invitationsService.findOne(payload.invitation);
  }

  updateOne(@Payload() payload: UpdateInvitationPayload): Promise<Invitation> {
    return this.invitationsService.updateOne(
      payload.invitation,
      payload.data.expiresAt,
      payload.data.privileges
    );
  }
}
