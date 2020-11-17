import { Injectable } from "@nestjs/common";

import { FindConditions, FindOneOptions } from "typeorm";

import { CreateUser } from "@quicksend/interfaces";

import { FolderService } from "../folder/folder.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "../folder/entities/folder.entity";
import { UserEntity } from "./entities/user.entity";

import { EmailTaken, UsernameTaken } from "./user.exceptions";

@Injectable()
export class UserService {
  constructor(
    private readonly folderService: FolderService,
    private readonly uowService: UnitOfWorkService
  ) {}

  get folderRepository() {
    return this.uowService.getRepository(FolderEntity);
  }

  get userRepository() {
    return this.uowService.getRepository(UserEntity);
  }

  async create(payload: CreateUser): Promise<UserEntity> {
    const isEmailTaken = await this.userRepository.findOne(
      { email: payload.email },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailTaken();
    }

    const isUsernameTaken = await this.userRepository.findOne(
      { username: payload.username },
      { withDeleted: true }
    );

    if (isUsernameTaken) {
      throw new UsernameTaken();
    }

    const user = await this.userRepository.save(
      this.userRepository.create(payload)
    );

    await this.folderRepository.save(
      this.folderRepository.create({ isRoot: true, name: "/", user })
    );

    return user;
  }

  async deleteOne(user: UserEntity): Promise<void> {
    await this.userRepository.softDelete({ id: user.id });
  }

  findOne(
    conditions: FindConditions<UserEntity>,
    options?: FindOneOptions<UserEntity>
  ): Promise<UserEntity | undefined> {
    return this.userRepository.findOne(conditions, options);
  }

  findOneByQuery(
    options: FindOneOptions<UserEntity>
  ): Promise<UserEntity | undefined> {
    return this.userRepository.findOne(options);
  }
}
