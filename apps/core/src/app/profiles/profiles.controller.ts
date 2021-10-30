import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import { Transactional } from "../common/decorators/transactional.decorator";

import { ProfilesService } from "./profiles.service";

import { Profile } from "./entities/profile.entity";

import { FindProfilePayload } from "./payloads/find-profile.payload";

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @MessagePattern("profiles.profile.find")
  async findOne(@Payload() payload: FindProfilePayload): Promise<Profile> {
    return this.profilesService.findOne(payload);
  }

  // @EventPattern("auth.user.created")
  // @Transactional()
  // async handleUserCreated(payload: any): Promise<void> {
  //   await this.profilesService.create(payload.created);
  // }

  // @EventPattern("auth.user.deleted")
  // @Transactional()
  // async handleUserDeleted(payload: any): Promise<void> {
  //   await this.profilesService.deleteOne({ user: payload.deleted.id });
  // }
}
