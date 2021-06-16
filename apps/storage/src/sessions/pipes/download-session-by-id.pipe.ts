import { Injectable, PipeTransform } from "@nestjs/common";

import { SessionsService } from "../sessions.service";

import { DownloadSession } from "../entities/download-session.entity";

import { DownloadSessionNotFoundException } from "../sessions.exceptions";

@Injectable()
export class DownloadSessionByIdPipe implements PipeTransform {
  constructor(private readonly sessionsService: SessionsService) {}

  async transform(id: string): Promise<DownloadSession> {
    const downloadSession = await this.sessionsService.findDownloadSession(id);

    if (!downloadSession) {
      throw new DownloadSessionNotFoundException();
    }

    return downloadSession;
  }
}
