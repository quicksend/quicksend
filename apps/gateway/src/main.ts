import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app/app.module";

import { Config } from "./config/config.interface";

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const port = configService.get("PORT");

  await app.listen(port, () => Logger.log(`Listening on port ${port}`));
})();
