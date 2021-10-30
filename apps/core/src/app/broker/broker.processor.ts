import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Job } from "bull";

import { lastValueFrom } from "rxjs";

import { Config } from "../common/config/config.schema";

import { EmitEventJob, EMIT_EVENT } from "./jobs/emit-event.job";

@Injectable()
@Processor(BrokerProcessor.QUEUE_NAME)
export class BrokerProcessor {
  static readonly QUEUE_NAME = "broker";

  private readonly client: NatsClient;

  constructor(private readonly configService: ConfigService<Config>) {
    this.client = new NatsClient({
      connection: {
        pass: this.configService.get("nats").password,
        servers: this.configService.get("nats").servers,
        user: this.configService.get("nats").username
      }
    });
  }

  @Process(EMIT_EVENT)
  emitEvent(job: Job<EmitEventJob>): Promise<unknown> {
    const { pattern, payload } = job.data;

    return lastValueFrom(this.client.emit(pattern, payload));
  }
}
