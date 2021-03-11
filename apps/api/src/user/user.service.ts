import { Injectable } from "@nestjs/common";

import { FindConditions, FindOneOptions } from "typeorm";

import { generateRandomString } from "@quicksend/utils";

import { FoldersService } from "../folders/folders.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { UserEntity } from "./user.entity";

import {
  CantFindUserException,
  EmailConflictException,
  IncorrectPasswordException,
  UsernameConflictException
} from "./user.exceptions";

@Injectable()
export class UserService {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly uowService: UnitOfWorkService
  ) {}

  private get userRepository() {
    return this.uowService.getRepository(UserEntity);
  }

  /**
   * Removes activation token from user to "activate" it
   */
  async activate(token: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      activationToken: token
    });

    if (!user || user.activated) {
      throw new CantFindUserException();
    }

    user.activationToken = null;

    return this.userRepository.save(user);
  }

  /**
   * Create a new user if the email and username does not exist
   */
  async create(
    email: string,
    password: string,
    username: string
  ): Promise<UserEntity> {
    const isEmailTaken = await this.userRepository.findOne(
      { email },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    const isUsernameTaken = await this.userRepository.findOne(
      { username },
      { withDeleted: true }
    );

    if (isUsernameTaken) {
      throw new UsernameConflictException();
    }

    const activationToken = await generateRandomString(16);

    const user = this.userRepository.create({
      activationToken,
      email,
      password,
      username
    });

    await this.userRepository.save(user);

    await this.foldersService.create("/", null, user);

    return user;
  }

  /**
   * Delete a user and all their files if the provided password is correct
   */
  async deleteOne(user: UserEntity, password: string): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new IncorrectPasswordException();
    }

    user.activationToken = null;
    user.admin = false;
    user.password = null;

    await this.userRepository.save(user);
    await this.userRepository.softDelete({ id: user.id });
  }

  /**
   * Find a user or returns undefined if it does not exist
   */
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
