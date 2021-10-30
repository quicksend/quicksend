import { Inject, Injectable } from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Observable } from "rxjs";

import { NATS_CLIENT } from "../app.constants";

import { Application } from "./resources/application.resource";

@Injectable()
export class ApplicationsService {
  constructor(@Inject(NATS_CLIENT) private readonly client: NatsClient) {}

  create(payload: any): Observable<Application> {
    return this.client.send("applications.application.create", payload);
  }

  deleteOne(payload: any): Observable<Application> {
    return this.client.send("applications.application.delete", payload);
  }

  findOne(payload: any): Observable<Application> {
    return this.client.send("applications.application.find", payload);
  }

  reset(payload: any): Observable<Application> {
    return this.client.send("applications.application.reset", payload);
  }

  updateOne(payload: any): Observable<Application> {
    return this.client.send("applications.application.update", payload);
  }
}
