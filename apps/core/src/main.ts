import helmet from "helmet";

import { ConfigService } from "@nestjs/config";
import { INestApplication, INestMicroservice, Logger } from "@nestjs/common";
import { MicroserviceOptions } from "@nestjs/microservices";
import { NestFactory } from "@nestjs/core";

import { NatsTransportStrategy } from "@alexy4744/nestjs-nats-jetstream-transporter";

import { OgmaService } from "@ogma/nestjs-module";

import { AppModule } from "./app/app.module";

import { Config } from "./app/common/config/config.schema";

import { BullBoardService } from "./app/bull-board/bull-board.service";

import { ApplicationEvent } from "./app/applications/events/application.event";
import { FileEvent } from "./app/storage/events/file.event";
import { InvitationEvent } from "./app/items/events/invitation.event";
import { ItemEvent } from "./app/items/events/item.event";
import { VersionEvent } from "./app/items/events/version.event";
import { ProfileEvent } from "./app/profiles/events/profile.event";
import { UserEvent } from "./app/users/events/user.event";

export const createApplication = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const bullBoardService = app.get<BullBoardService>(BullBoardService);

  bullBoardService.adapter.setBasePath("/jobs");

  app.enableCors();

  app.use(helmet());

  app.use("/jobs", bullBoardService.adapter.getRouter());

  app.useLogger(app.get(OgmaService));

  return app.init();
};

export const createMicroservice = (app: INestApplication): Promise<INestMicroservice> => {
  const configService = app.get<ConfigService<Config>>(ConfigService);

  const microservice = app.connectMicroservice<MicroserviceOptions>(
    {
      strategy: new NatsTransportStrategy({
        connection: {
          pass: configService.get("nats").password,
          servers: configService.get("nats").servers,
          user: configService.get("nats").username
        },
        consumer: (options): void => {
          options.deliverTo("quicksend");
          options.durable("quicksend");
          options.queue("quicksend");
        },
        queue: "quicksend",
        streams: [
          {
            name: "quicksend",
            subjects: [
              ...Object.values(ApplicationEvent),
              ...Object.values(FileEvent),
              ...Object.values(InvitationEvent),
              ...Object.values(ItemEvent),
              ...Object.values(ProfileEvent),
              ...Object.values(UserEvent),
              ...Object.values(VersionEvent)
            ]
          }
        ]
      })
    },
    {
      inheritAppConfig: true
    }
  );

  return microservice.init();
};

export const bootstrap = async (): Promise<void> => {
  const app = await createApplication();

  const microservice = await createMicroservice(app);

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const { port } = configService.get("http");

  await microservice.listen();

  await app
    .listen(port)
    .then(() => app.getUrl())
    .then((url) => Logger.log(`Listening on ${url}`));
};

bootstrap();
