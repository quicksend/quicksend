import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";
import { ValidateBody } from "../common/decorators/validate-body.decorator";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { FileByIdPipe } from "../files/pipes/file-by-id.pipe";
import { InvitationByIdPipe } from "./pipes/invitation-by-id.pipe";
import { InviteeByIdPipe } from "./pipes/invitee-by-id.pipe";

import { SharingExceptionFilter } from "./sharing.filter";
import { SharingService } from "./sharing.service";

import { File } from "../files/entities/file.entity";
import { Invitation } from "./entities/invitation.entity";
import { User } from "../user/entities/user.entity";

import { Privileges } from "./enums/privileges.enum";

import { CreateInvitationDto } from "./dtos/create-invitation.dto";
import { RemoveInvitationDto } from "./dtos/remove-invitation.dto";
import { UpdateInvitationDto } from "./dtos/update-invitation.dto";

@Controller("sharing")
@UseFilters(SharingExceptionFilter)
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_SHARING] })
  @Post()
  @Transactional()
  @ValidateBody(CreateInvitationDto)
  create(
    @Body() dto: CreateInvitationDto,
    @Body("file", FileByIdPipe(Privileges.WRITE_FILE_SHARING)) file: File,
    @Body("invitee", InviteeByIdPipe) invitee: Maybe<User>,
    @CurrentUser() user: User
  ): Promise<Invitation> {
    return this.sharingService.create({
      ...dto,
      file,
      invitee,
      inviter: user
    });
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_SHARING] })
  @Delete(":id")
  @Transactional()
  @ValidateBody(RemoveInvitationDto)
  deleteOne(
    @Param("id", InvitationByIdPipe(Privileges.WRITE_FILE_SHARING)) invitation: Invitation,
    @Body("removeDescendants") removeDescendants?: boolean
  ): Promise<Invitation> {
    return this.sharingService.deleteOne(invitation, removeDescendants);
  }

  @Auth({ scopes: [ApplicationScopes.READ_FILE_SHARING] })
  @Get(":id")
  findOne(
    @Param("id", InvitationByIdPipe(Privileges.WRITE_FILE_SHARING)) invitation: Invitation
  ): Invitation {
    return invitation;
  }

  @Auth({ scopes: [ApplicationScopes.WRITE_FILE_SHARING] })
  @Patch(":id")
  @Transactional()
  @ValidateBody(UpdateInvitationDto)
  updateOne(
    @Param("id", InvitationByIdPipe(Privileges.WRITE_FILE_SHARING)) invitation: Invitation,
    @Body("expiresAt") expiresAt?: Date,
    @Body("privileges") privileges?: Array<keyof typeof Privileges>
  ): Promise<Invitation> {
    return this.sharingService.updateOne(invitation, expiresAt, privileges);
  }
}
