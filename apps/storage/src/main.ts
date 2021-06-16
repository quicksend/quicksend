import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { MicroserviceOptions } from "@nestjs/microservices";
import { NestFactory } from "@nestjs/core";

import { NatsTransportStrategy } from "@quicksend/nestjs-nats";

import { AppModule } from "./app/app.module";

import { Config } from "./config/config.interface";

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const port = configService.get("PORT");

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    strategy: new NatsTransportStrategy({
      connection: {
        servers: [configService.get("NATS_URL") as string]
      },
      queue: "storage-service",
      streams: [
        {
          name: "storage-events",
          subjects: []
        }
      ]
    })
  });

  await microservice.listenAsync();

  await app.listen(port, () => Logger.log(`Listening on port ${port}`));
})();
