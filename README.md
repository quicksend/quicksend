<p align="center">
  <a href="https://github.com/quicksend" target="blank">
    <img src="https://raw.githubusercontent.com/quicksend/frontend/master/src/assets/logo/vector/default-monochrome.svg" width="320" alt="Quicksend" />
  </a>
</p>
  
## Monorepo Structure

| Project                           | Description                    |
| --------------------------------- | ------------------------------ |
| [Applications](apps/applications) | Developer Applications Service |
| [CLI](apps/cli)                   | CLI Client                     |
| [Files](apps/files)               | Files + Invitations Service    |
| [Gateway](apps/gateway)           | Gateway API for Clients        |
| [Mailer](apps/mailer)             | Email Service                  |
| [Storage](apps/storage)           | Storage Service                |
| [Users](apps/users)               | Users Service                  |
| [Web](apps/web)                   | Next.js Web Client             |

| Library                                    | Description                               |
| ------------------------------------------ | ----------------------------------------- |
| [@quicksend/common](libs/common)           | Common utility library                    |
| [@quicksend/nestjs-nats](libs/nestjs-nats) | NATS JetStream transporter for NestJS     |
| [@quicksend/sdk](libs/sdk)                 | Quicksend SDK for extending functionality |
| [@quicksend/types](libs/types)             | Common types                              |
