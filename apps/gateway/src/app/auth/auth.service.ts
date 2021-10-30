import { Inject, Injectable } from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Observable, map } from "rxjs";

import { NATS_CLIENT } from "../app.constants";

import { RegisterDto } from "./dtos/register.dto";

import { JwtCredentials } from "./resources/jwt-credentials.resource";

@Injectable()
export class AuthService {
  constructor(@Inject(NATS_CLIENT) private readonly client: NatsClient) {}

  confirmEmail(payload: any): Observable<void> {
    return this.client.send("auth.user.confirm-email", payload);
  }

  login(username: string, password: string): Observable<JwtCredentials> {
    return this.client.send("auth.exchange.password", {
      password,
      username
    });
  }

  logout(refreshToken: string): Observable<void> {
    return this.client.send("auth.blacklist.refresh-token", {
      refreshToken
    });
  }

  refreshToken(refreshToken: string): Observable<JwtCredentials> {
    return this.client.send("auth.exchange.refresh-token", {
      refreshToken
    });
  }

  register(payload: RegisterDto): Observable<void> {
    return this.client.send("auth.user.create", payload).pipe(map(() => undefined));
  }

  resetPassword(payload: any): Observable<void> {
    return this.client.send("auth.user.reset-password", payload);
  }
}
