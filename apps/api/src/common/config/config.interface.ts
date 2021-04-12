import { DiskManagerOptions } from "@quicksend/transmit";

export interface Config {
  database: {
    debug: boolean;
    hostname: string;
    name: string;
    password: string;
    port: number;
    username: string;
  };

  limits: {
    maxFileSize: number;
  };

  port: number;

  purge: {
    limit: number;
  };

  recaptcha: {
    secret: string;
    url: string;
  };

  redis: {
    hostname: string;
    password: string;
    port: number;
    username: string;
  };

  secrets: {
    sessions: string;
  };

  smtp: {
    from: string;
    hostname: string;
    password: string;
    port: number;
    secure: boolean;
    username: string;
  };

  storage: {
    manager: string;
    options: DiskManagerOptions;
  };

  throttler: {
    limit: number;
    ttl: number;
  };

  urls: {
    backend: string;
    frontend: string;
  };
}
