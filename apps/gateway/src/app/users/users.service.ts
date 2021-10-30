import { Inject, Injectable } from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Observable } from "rxjs";

import { NATS_CLIENT } from "../app.constants";

import { User } from "./resources/user.resource";

@Injectable()
export class UsersService {
  constructor(@Inject(NATS_CLIENT) private readonly client: NatsClient) {}

  changeEmail(payload: any): Observable<void> {
    return this.client.send("auth.user.change-email", payload);
  }

  changePassword(payload: any): Observable<User> {
    return this.client.send("auth.user.change-password", payload);
  }

  confirmEmail(payload: any): Observable<void> {
    return this.client.send("auth.user.confirm-email", payload);
  }

  deleteOne(payload: any): Observable<User> {
    return this.client.send("auth.user.delete", payload);
  }

  findOne(payload: any): Observable<User> {
    return this.client.send("auth.user.find", payload);
  }

  resetPassword(payload: any): Observable<void> {
    return this.client.send("auth.user.reset-password", payload);
  }
}
