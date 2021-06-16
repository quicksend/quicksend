import { CustomTransportStrategy, MessageHandler, Server } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";

import {
  Codec,
  ConsumerInfo,
  JetStreamManager,
  JsMsg,
  JSONCodec,
  Msg,
  NatsConnection,
  StreamInfo,
  connect,
  createInbox
} from "nats";

import { toJsMsg } from "nats/lib/nats-base-client/jsmsg";

import { noop } from "rxjs";

import { NatsTransportStrategyOptions } from "./interfaces/nats-transport-strategy-options.interface";
import { NatsStreamConfig } from "./interfaces/nats-stream-config.interface";

import { NatsContext } from "./nats.context";

import { NACK, TERM } from "./nats.constants";

export class NatsTransportStrategy extends Server implements CustomTransportStrategy {
  protected readonly codec: Codec<unknown>;
  protected readonly logger: Logger;

  protected client?: NatsConnection;

  constructor(protected readonly options: NatsTransportStrategyOptions) {
    super();
    this.codec = options.codec || JSONCodec();
    this.logger = new Logger("NatsServer");
  }

  async listen(callback: typeof noop): Promise<void> {
    const client = await connect(this.options.connection);
    const jetstreamManager = await client.jetstreamManager();

    this.client = client;

    this.handleStatusUpdates(client);

    await this.createStreams(jetstreamManager, this.options.streams);

    await this.subscribeToEventPatterns(client, jetstreamManager);
    await this.subscribeToMessagePatterns(client);

    this.logger.log(`Connected to ${client.getServer()}`);

    callback();
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.drain();
    }
  }

  protected async createStreams(
    manager: JetStreamManager,
    configs: NatsStreamConfig[] = []
  ): Promise<StreamInfo[]> {
    return Promise.all(configs.map((config) => this.upsertStream(manager, config)));
  }

  protected async handleJetStreamMessage(message: JsMsg, handler: MessageHandler): Promise<void> {
    const decoded = this.codec.decode(message.data);

    message.working();

    const signal = await handler(decoded, new NatsContext([message]))
      .then((maybeObservable) => this.transformToObservable(maybeObservable))
      .then((observable) => observable.toPromise());

    if (signal === NACK) {
      return message.nak();
    }

    if (signal === TERM) {
      return message.term();
    }

    message.ack();
  }

  protected async handleNatsMessage(message: Msg, handler: MessageHandler): Promise<void> {
    const decoded = this.codec.decode(message.data);

    const maybeObservable = await handler(decoded, new NatsContext([message]));
    const response$ = this.transformToObservable(maybeObservable);

    this.send(response$, (response) => {
      const encoded = this.codec.encode(response);

      message.respond(encoded);
    });
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

  protected async subscribeToEventPatterns(
    client: NatsConnection,
    manager: JetStreamManager
  ): Promise<void> {
    const eventHandlers = [...this.messageHandlers.entries()].filter(
      ([, handler]) => handler.isEventHandler
    );

    for (const [pattern, handler] of eventHandlers) {
      const stream = await this.findStream(manager, pattern);

      if (!stream) {
        this.logger.warn(`No stream found for the event pattern "${pattern}"`);
        continue;
      }

      let consumer = await this.findConsumer(manager, stream.config.name, (consumer) => {
        return consumer.config.filter_subject === pattern;
      });

      if (!consumer) {
        const options = Object.assign({}, this.options.consumer);

        if (!options.deliver_subject) {
          options.deliver_subject = createInbox();
        }

        if (options.durable_name) {
          options.durable_name = this.createDurableName(options.durable_name, pattern);
        }

        options.filter_subject = pattern;

        consumer = await manager.consumers.add(stream.config.name, options);
      }

      // Can't use the jetstream client because it does not allow queue group subscriptions
      client.subscribe(consumer.config.deliver_subject as string, {
        callback: (error, message) => {
          if (error) {
            return this.logger.error(error.message, error.stack);
          }

          return this.handleJetStreamMessage(toJsMsg(message), handler);
        },
        queue: this.options.queue
      });

      this.logger.verbose(`Subscribed to "${pattern}" events`);
    }
  }

  protected async subscribeToMessagePatterns(client: NatsConnection): Promise<void> {
    const messageHandlers = [...this.messageHandlers.entries()].filter(
      ([, handler]) => !handler.isEventHandler
    );

    for (const [pattern, handler] of messageHandlers) {
      client.subscribe(pattern, {
        callback: (error, message) => {
          if (error) {
            return this.logger.error(error.message, error.stack);
          }

          return this.handleNatsMessage(message, handler);
        },
        queue: this.options.queue
      });

      this.logger.verbose(`Subscribed to "${pattern}" messages`);
    }
  }

  /**
   * Create a durable name that follows NATS naming rules
   * @see https://docs.nats.io/jetstream/administration/naming
   */
  protected createDurableName(...parts: string[]): string {
    return parts.join("-").replace(/\s|\.|>|\*/g, "-");
  }

  /**
   * Find a consumer of a stream based on a predicate
   */
  protected async findConsumer(
    manager: JetStreamManager,
    stream: string,
    predicate: (consumer: ConsumerInfo) => boolean
  ): Promise<ConsumerInfo | null> {
    const lister = manager.consumers.list(stream);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const consumers = await lister.next();

      if (consumers.length <= 0) {
        return null;
      }

      for (const consumer of consumers) {
        if (predicate(consumer)) {
          return consumer;
        }
      }
    }
  }

  /**
   * Find a stream by subject
   */
  protected async findStream(
    manager: JetStreamManager,
    subject: string
  ): Promise<StreamInfo | null> {
    try {
      const name = await manager.streams.find(subject);
      const stream = await manager.streams.info(name);

      return stream;
    } catch (error) {
      if (error.message === "no stream matches subject") {
        return null;
      }

      throw error;
    }
  }

  /**
   * Creates a new stream if it doesn't exist, otherwise updates the existing stream
   */
  protected async upsertStream(
    manager: JetStreamManager,
    config: NatsStreamConfig
  ): Promise<StreamInfo> {
    try {
      const stream = await manager.streams.info(config.name);

      return manager.streams.update({
        ...stream.config,
        ...config
      });
    } catch (error) {
      if (error.message === "stream not found") {
        return manager.streams.add(config);
      }

      throw error;
    }
  }
}
