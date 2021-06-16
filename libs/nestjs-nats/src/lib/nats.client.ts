import { ClientProxy, ReadPacket, WritePacket } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";

import { Codec, JetStreamClient, JSONCodec, NatsConnection, connect } from "nats";

import { noop } from "rxjs";

import { NatsClientOptions } from "./interfaces/nats-client-options.interface";

export class NatsClient extends ClientProxy {
  protected readonly codec: Codec<unknown>;
  protected readonly logger: Logger;

  protected client?: NatsConnection;
  protected jetstreamClient?: JetStreamClient;

  constructor(protected readonly options: NatsClientOptions = {}) {
    super();
    this.codec = options.codec || JSONCodec();
    this.logger = new Logger(this.constructor.name);
  }

  async connect(): Promise<NatsConnection> {
    if (this.client) {
      return this.client;
    }

    const client = await connect(this.options.connection);
    const jetstreamClient = client.jetstream();

    this.client = client;
    this.jetstreamClient = jetstreamClient;

    this.handleStatusUpdates(client);

    this.logger.log(`Connected to ${client.getServer()}`);

    return client;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.drain();

      this.client = undefined;
      this.jetstreamClient = undefined;
    }
  }

  emitAsync<Pattern, Payload, Result>(pattern: Pattern, payload: Payload): Promise<Result> {
    return this.emit(pattern, payload).toPromise();
  }

  getClient(): NatsConnection | undefined {
    return this.client;
  }

  getJetStreamClient(): JetStreamClient | undefined {
    return this.jetstreamClient;
  }

  sendAsync<Pattern, Payload, Result>(pattern: Pattern, payload: Payload): Promise<Result> {
    return this.send(pattern, payload).toPromise();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async dispatchEvent(packet: ReadPacket): Promise<any> {
    if (!this.jetstreamClient) {
      throw new Error("JetStream client not connected!");
    }

    const payload = this.codec.encode(packet.data);
    const subject = this.normalizePattern(packet.pattern);

    await this.jetstreamClient.publish(subject, payload);
  }

  protected publish(packet: ReadPacket, callback: (packet: WritePacket) => void): typeof noop {
    if (!this.client) {
      throw new Error("NATS client not connected!");
    }

    const payload = this.codec.encode(packet.data);
    const subject = this.normalizePattern(packet.pattern);

    this.client
      .request(subject, payload)
      .then((encoded) => this.codec.decode(encoded.data) as WritePacket)
      .then((packet) => callback(packet))
      .catch((err) => callback({ err }));

    // No teardown function needed as the subscription is handled for us, so return noop
    return noop;
  }

  protected async handleStatusUpdates(client: NatsConnection): Promise<void> {
    for await (const { data, type } of client.status()) {
      const payload = JSON.stringify(data, null, 2);

      if (type === "disconnect" || type === "error") {
        this.logger.error(`NatsError: type: "${type}", data: "${payload}".`);
      } else {
        this.logger.verbose(`NatsStatus: type: "${type}", data: "${payload}".`);
      }
    }
  }
}
