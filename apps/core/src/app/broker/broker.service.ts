import { InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { NatsClient } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { Observable, lastValueFrom } from "rxjs";
import { Queue } from "bull";

import { Config } from "../common/config/config.schema";

import { BrokerProcessor } from "./broker.processor";

import { EMIT_EVENT } from "./jobs/emit-event.job";

@Injectable()
export class BrokerService {
  readonly client: NatsClient;

  constructor(
    private readonly configService: ConfigService<Config>,

    @InjectQueue(BrokerProcessor.QUEUE_NAME)
    private readonly brokerProcessor: Queue
  ) {
    this.client = new NatsClient({
      connection: {
        pass: this.configService.get("nats").password,
        servers: this.configService.get("nats").servers,
        user: this.configService.get("nats").username
      }
    });
  }

  emit<T, R>(pattern: string, payload: T): Observable<R> {
    return this.client.emit<R, T>(pattern, payload);
  }

  send<T, R>(pattern: string, payload: T): Observable<R> {
    return this.client.send<R, T>(pattern, payload);
  }

  async emitAsync<T>(pattern: string, payload: T): Promise<void> {
    await this.brokerProcessor.add(EMIT_EVENT, { pattern, payload }, { attempts: 5 });
  }

  async sendAsync<T, R>(pattern: string, payload: T): Promise<R> {
    return lastValueFrom(this.client.send<R, T>(pattern, payload));
  }
}
