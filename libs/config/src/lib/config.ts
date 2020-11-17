import * as convict from "convict";
import * as formats from "convict-format-with-validator";
import * as yaml from "js-yaml";

import { Config } from "./interfaces/config.interface";

convict.addFormats(formats);

convict.addParser({
  extension: ["yml", "yaml"],
  parse: yaml.safeLoad
});

const config = convict<Config>({
  branding: {
    default: "Quicksend",
    format: String
  },

  database: {
    hostname: {
      doc: "hostname of the database connection",
      default: "localhost",
      format: String
    },
    name: {
      doc: "name of the database",
      default: "quicksend",
      format: String
    },
    password: {
      doc: "password of the database user",
      default: "",
      format: String,
      sensitive: true
    },
    port: {
      doc: "port of the database connection",
      default: 5432,
      format: "port"
    },
    username: {
      doc: "username of the database user",
      default: "",
      format: String,
      sensitive: true
    }
  },

  domains: {
    backend: {
      doc: "domain name for the backend",
      default: null,
      format: String
    },
    frontend: {
      doc: "domain name for the frontend",
      default: null,
      format: String
    }
  },

  env: {
    doc: "the application environment",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },

  port: {
    doc: "port to listen on",
    default: 3000,
    format: "port"
  },

  redis: {
    hostname: {
      doc: "hostname of the redis connection",
      default: "localhost",
      format: String
    },
    port: {
      doc: "port of the redis connection",
      default: 6379,
      format: "port"
    }
  },

  secrets: {
    applications: {
      doc: "secret used to generate application keys",
      default: null,
      format: String,
      sensitive: true
    },
    recaptcha: {
      doc: "secret used for recaptcha validation",
      default: null,
      format: String,
      sensitive: true
    },
    sessions: {
      doc: "secret used for session cookies",
      default: null,
      format: String,
      sensitive: true
    }
  },

  smtp: {
    from: {
      doc: "email used as the sender",
      default: null,
      format: "email"
    },
    host: {
      doc: "host of the SMTP server",
      default: null,
      format: String
    },
    password: {
      doc: "password of the SMTP account",
      default: null,
      format: String,
      sensitive: true
    },
    port: {
      doc: "port of the SMTP server",
      default: 465,
      format: "port"
    },
    secure: {
      doc: "whether the SMTP connection should be secure",
      default: true,
      format: Boolean
    },
    tls: {
      doc: "whether the SMTP connection should use TLS",
      default: true,
      format: Boolean
    },
    username: {
      doc: "username of the SMTP account",
      default: null,
      format: String,
      sensitive: true
    }
  },

  storage: {
    engine: {
      doc: "storage engine to use",
      default: "disk",
      format: String
    },
    limits: {
      files: {
        doc: "maximum amount of files that can be uploaded in one request",
        default: 1,
        format: "nat"
      },
      fileSize: {
        doc: "maximum size per file when uploading",
        default: 25 * 1024 * 1024,
        format: "nat"
      }
    },
    options: {
      doc: "storage engine options",
      default: {
        directory: "/uploads"
      } as never,
      format: Object
    }
  },

  throttler: {
    limit: {
      doc:
        "number of requests that can hit an endpoint before being ratelimited",
      default: 250,
      format: "nat"
    },
    ttl: {
      doc: "ratelimiter cooldown in seconds",
      default: 60,
      format: "nat"
    }
  },

  uploadsDirectory: {
    doc: "path to uploaded files",
    default: "/uploads",
    format: String
  }
});

config.loadFile(`./config/${config.get("env")}.yml`);
config.validate({ allowed: "strict" });

export { config };
