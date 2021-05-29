import { Injectable, PipeTransform } from "@nestjs/common";

import { UserService } from "../../user/user.service";

import { User } from "../../user/entities/user.entity";

import { InviteeNotFoundException } from "../sharing.exceptions";

@Injectable()
export class InviteeByIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(id?: string): Promise<User | null> {
    const user = await this.userService.findOne({ id });

    if (id && !user) {
      throw new InviteeNotFoundException();
    }

    return user;
  }
}
