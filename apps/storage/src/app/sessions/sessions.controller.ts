import {
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UseInterceptors,
  UsePipes
} from "@nestjs/common";

import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import { File } from "@quicksend/transmit";
import { Files, TransmitInterceptor } from "@quicksend/nestjs-transmit";

import { UserDeletedPattern, UserDeletedPayload } from "@quicksend/types";

import { ValidationPipe, ValidationRpcExceptionFilter } from "@quicksend/common";

import { SessionsExceptionFilter } from "./sessions.filter";
import { SessionsService } from "./sessions.service";

import { DownloadSession } from "./entities/download-session.entity";
import { UploadSession } from "./entities/upload-session.entity";

import { CreateDownloadSessionPayload } from "./payloads/create-download-session.payload";
import { CreateUploadSessionPayload } from "./payloads/create-upload-session.payload";

import { DownloadSessionByIdPipe } from "./pipes/download-session-by-id.pipe";
import { UploadSessionByIdPipe } from "./pipes/upload-session-by-id.pipe";

@Controller()
@UseFilters(SessionsExceptionFilter)
@UsePipes(ValidationPipe())
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(":session/download")
  download(
    @Param("session", DownloadSessionByIdPipe) session: DownloadSession
  ): Promise<NodeJS.ReadableStream> {
    return this.sessionsService.streamFileContents(session);
  }

  @Post(":session/upload")
  @UseInterceptors(TransmitInterceptor({ field: "file" }))
  upload(
    @Param("session", UploadSessionByIdPipe) session: UploadSession,
    @Files() files: File[]
  ): Promise<void> {
    return this.sessionsService.commitUploadSession(session, files[0]);
  }

  @MessagePattern({ cmd: "create-download-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  createDownloadSession(
    @Payload() payload: CreateDownloadSessionPayload
  ): Promise<DownloadSession> {
    return this.sessionsService.createDownloadSession(
      payload.owner,
      payload.hash,
      payload.expiresAt
    );
  }

  @MessagePattern({ cmd: "create-upload-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  createUploadSession(@Payload() payload: CreateUploadSessionPayload): Promise<UploadSession> {
    return this.sessionsService.createUploadSession(payload.owner, payload.expiresAt);
  }

  @MessagePattern({ cmd: "delete-download-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  deleteDownloadSession(
    @Payload(DownloadSessionByIdPipe) session: DownloadSession
  ): Promise<DownloadSession> {
    return this.sessionsService.deleteDownloadSession(session);
  }

  @MessagePattern({ cmd: "delete-upload-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  deleteUploadSession(
    @Payload(UploadSessionByIdPipe) session: UploadSession
  ): Promise<UploadSession> {
    return this.sessionsService.deleteUploadSession(session);
  }

  @MessagePattern({ cmd: "delete-download-sessions", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  deleteDownloadSessions(@Payload() owner: string): Promise<void> {
    return this.sessionsService.deleteDownloadSessions({ owner });
  }

  @MessagePattern({ cmd: "delete-upload-sessions", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  deleteUploadSessions(@Payload() owner: string): Promise<void> {
    return this.sessionsService.deleteUploadSessions({ owner });
  }

  @MessagePattern({ cmd: "find-download-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  findDownloadSession(@Payload(DownloadSessionByIdPipe) session: DownloadSession): DownloadSession {
    return session;
  }

  @MessagePattern({ cmd: "find-upload-session", service: "sessions" })
  @UseFilters(ValidationRpcExceptionFilter)
  findUploadSession(@Payload(UploadSessionByIdPipe) session: UploadSession): UploadSession {
    return session;
  }

  @EventPattern<UserDeletedPattern>("users.user.deleted")
  handleUserDeletion(payload: UserDeletedPayload): Promise<void[]> {
    return Promise.all([
      this.sessionsService.deleteDownloadSessions({ owner: payload.user.id }),
      this.sessionsService.deleteUploadSessions({ owner: payload.user.id })
    ]);
  }
}
