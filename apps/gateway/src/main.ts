import helmet from "helmet";

import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication, Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { OgmaService } from "@ogma/nestjs-module";

import { AppModule } from "./app/app.module";

import { Config } from "./app/common/config/config.schema";

export const createApplication = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.enableCors({
    credentials: true
  });

  app.enableVersioning({
    type: VersioningType.URI
  });

  app.setGlobalPrefix("api");

  app.use(helmet());

  app.useLogger(app.get(OgmaService));

  setupSwagger(app);

  return app.init();
};

export const setupSwagger = (app: INestApplication): INestApplication => {
  const options = new DocumentBuilder()
    .setTitle("Quicksend")
    .setDescription("Quicksend API Swagger explorer")
    .setVersion("1.0")
    .addApiKey({ name: "Authorization", scheme: "App", type: "apiKey" })
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("/api/explorer", app, document, {
    customSiteTitle: "Quicksend API Explorer",
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  return app;
};

export const bootstrap = async (): Promise<void> => {
  const app = await createApplication();

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const { port } = configService.get("http");

  await app
    .listen(port)
    .then(() => app.getUrl())
    .then((url) => Logger.log(`Listening on ${url}`));
};

bootstrap();
