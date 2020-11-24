export interface Config {
  advanced: {
    garbageCollector: {
      frequency: number;
      threshold: number;
    };
  };

  branding: string;

  database: {
    hostname: string;
    name: string;
    password: string;
    port: number;
    username: string;
  };

  domains: {
    backend: string;
    frontend: string;
  };

  env: string;

  port: number;

  redis: {
    hostname: string;
    port: number;
  };

  secrets: {
    applications: string;
    recaptcha: string;
    sessions: string;
  };

  smtp: {
    from: string;
    host: string;
    password: string;
    port: number;
    secure: boolean;
    tls: boolean;
    username: string;
  };

  storage: {
    engine: "disk" | "google-cloud";

    limits: {
      files: number;
      fileSize: number;
    };

    options: never;
  };

  throttler: {
    limit: number;
    ttl: number;
  };

  uploadsDirectory: string;
}
