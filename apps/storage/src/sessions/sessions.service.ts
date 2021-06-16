import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { File as UploadedFile } from "@quicksend/transmit";

import { StorageService } from "../storage/storage.service";

import { DownloadSession } from "./entities/download-session.entity";
import { UploadSession } from "./entities/upload-session.entity";

import { DownloadSessionNotFoundException } from "./sessions.exceptions";

@Injectable()
export class SessionsService {
  constructor(
    private readonly storageService: StorageService,

    @InjectRepository(DownloadSession)
    private readonly downloadSessionRepository: EntityRepository<DownloadSession>,

    @InjectRepository(UploadSession)
    private readonly uploadSessionRepository: EntityRepository<UploadSession>
  ) {}

  async commitUploadSession(
    uploadSession: UploadSession,
    uploadedFile: UploadedFile
  ): Promise<void> {
    await this.storageService.create(
      uploadedFile.discriminator,
      uploadedFile.hash,
      uploadedFile.size
    );

    uploadSession.commitedAt = Date.now();

    await this.uploadSessionRepository.persistAndFlush(uploadSession);
  }

  async createDownloadSession(
    owner: string,
    hash: string,
    expiresAt?: number
  ): Promise<DownloadSession> {
    const downloadSession = new DownloadSession();

    downloadSession.expiresAt = expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days default
    downloadSession.hash = hash;
    downloadSession.owner = owner;

    await this.downloadSessionRepository.persistAndFlush(downloadSession);

    return downloadSession;
  }

  async createUploadSession(owner: string, expiresAt?: number): Promise<UploadSession> {
    const uploadSession = new UploadSession();

    uploadSession.expiresAt = expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days default
    uploadSession.owner = owner;

    await this.uploadSessionRepository.persistAndFlush(uploadSession);

    return uploadSession;
  }

  async deleteDownloadSession(downloadSesion: DownloadSession): Promise<DownloadSession> {
    await this.downloadSessionRepository.removeAndFlush(downloadSesion);

    return downloadSesion;
  }

  async deleteDownloadSessions(filter: FilterQuery<DownloadSession>): Promise<void> {
    await this.downloadSessionRepository.nativeDelete(filter);
  }

  async deleteUploadSession(uploadSession: UploadSession): Promise<UploadSession> {
    await this.uploadSessionRepository.removeAndFlush(uploadSession);

    return uploadSession;
  }

  async deleteUploadSessions(filter: FilterQuery<UploadSession>): Promise<void> {
    await this.uploadSessionRepository.nativeDelete(filter);
  }

  async findDownloadSession(filter: FilterQuery<DownloadSession>): Promise<DownloadSession | null> {
    return this.downloadSessionRepository.findOne(filter);
  }

  async findUploadSession(filter: FilterQuery<UploadSession>): Promise<UploadSession | null> {
    return this.uploadSessionRepository.findOne(filter);
  }

  async streamFileContents(session: DownloadSession): Promise<NodeJS.ReadableStream> {
    const physicalFile = await this.storageService.findOne({
      hash: session.hash
    });

    if (!physicalFile) {
      throw new DownloadSessionNotFoundException();
    }

    return this.storageService.stream(physicalFile);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredSessions(): Promise<void> {
    await Promise.all([
      this.downloadSessionRepository.nativeDelete({
        expiresAt: {
          $lte: Date.now()
        }
      }),

      this.uploadSessionRepository.nativeDelete({
        expiresAt: {
          $lte: Date.now()
        }
      })
    ]);
  }
}
