import { BaseRpcContext } from "@nestjs/microservices/ctx-host/base-rpc.context";

import { JsMsg, Msg, MsgHdrs } from "nats";

type NatsContextArgs = [JsMsg | Msg];

export class NatsContext extends BaseRpcContext<NatsContextArgs> {
  constructor(args: NatsContextArgs) {
    super(args);
  }

  /**
   * Returns message headers (if exist).
   */
  getHeaders(): MsgHdrs | undefined {
    return this.args[0].headers;
  }

  /**
   * Returns the message object.
   */
  getMessage(): JsMsg | Msg {
    return this.args[0];
  }

  /**
   * Returns the name of the subject.
   */
  getSubject(): string {
    return this.args[0].subject;
  }

  /**
   * Check whether a NATS message is a JetStream message
   */
  isJetStreamMessage(message: JsMsg | Msg): message is JsMsg {
    return typeof (message as Msg).respond === "function";
  }
}
