import { ConfigService } from "@nestjs/config";
import { MicroserviceOptions } from "@nestjs/microservices";
import { NestFactory } from "@nestjs/core";

import { NatsTransportStrategy } from "@quicksend/nestjs-nats";

import { AppModule } from "./app/app.module";

import { Config } from "./config/config.interface";

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    strategy: new NatsTransportStrategy({
      connection: {
        servers: [configService.get("NATS_URL") as string]
      },
      consumer: {
        durable_name: "applications"
      },
      queue: "applications-service",
      streams: [
        {
          name: "applications-events",
          subjects: []
        }
      ]
    })
  });

  await microservice.listenAsync();
})();
