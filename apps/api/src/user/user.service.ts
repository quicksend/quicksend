import { Injectable } from "@nestjs/common";

import { FindConditions, FindOneOptions } from "typeorm";

import { CreateUser } from "@quicksend/interfaces";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FolderEntity } from "../folder/folder.entity";
import { UserEntity } from "./user.entity";

import { EmailTakenException, UsernameTakenException } from "./user.exceptions";

@Injectable()
export class UserService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get folderRepository() {
    return this.uowService.getTreeRepository(FolderEntity);
  }

  private get userRepository() {
    return this.uowService.getRepository(UserEntity);
  }

  async create(payload: CreateUser): Promise<UserEntity> {
    const isEmailTaken = await this.userRepository.findOne(
      { email: payload.email },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailTakenException();
    }

    const isUsernameTaken = await this.userRepository.findOne(
      { username: payload.username },
      { withDeleted: true }
    );

    if (isUsernameTaken) {
      throw new UsernameTakenException();
    }

    const user = this.userRepository.create(payload);

    await this.userRepository.save(user);

    const root = this.folderRepository.create({ name: "/", user });

    await this.folderRepository.save(root);

    return user;
  }

  async deleteOne(user: UserEntity): Promise<void> {
    const roots = await this.folderRepository.find({
      parent: null,
      user
    });

    await this.folderRepository.remove(roots);

    user.activated = false;
    user.admin = false;
    user.password = null;

    await this.userRepository.save(user);
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
