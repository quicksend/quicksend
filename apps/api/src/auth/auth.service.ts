import { URL } from "url";

import { ConfigType } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";

import { MailerService } from "@quicksend/nestjs-mailer";

import { UserService } from "../user/user.service";

import { UserEntity } from "../user/user.entity";

import {
  InvalidLoginCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

import { renderEmail } from "../common/utils/render-email.util";

import { httpNamespace } from "../config/config.namespaces";

@Injectable()
export class AuthService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: UserService,

    @Inject(httpNamespace.KEY)
    private readonly httpConfig: ConfigType<typeof httpNamespace>
  ) {}

  async login(username: string, password: string): Promise<UserEntity> {
    const user = await this.userService.findOneByQuery({
      where: [{ email: username }, { username }]
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new InvalidLoginCredentialsException();
    }

    if (!user.activated) {
      throw new UserNotActivatedException();
    }

    return user;
  }

  async register(
    email: string,
    password: string,
    username: string
  ): Promise<UserEntity> {
    const user = await this.userService.create(email, password, username);

    const activationUrl = new URL(
      `/user/activate/${user.activationToken}`,
      this.httpConfig.frontendUrl.toString()
    );

    const activationEmail = await renderEmail("activate-account", {
      url: activationUrl.href,
      username: user.username
    });

    await this.mailerService.send({
      html: activationEmail,
      to: email,
      subject: "Activate your account"
    });

    return user;
  }
}
