import { Injectable, PipeTransform } from "@nestjs/common";

import { SessionsService } from "../sessions.service";

import { UploadSession } from "../entities/upload-session.entity";

import { UploadSessionNotFoundException } from "../sessions.exceptions";

@Injectable()
export class UploadSessionByIdPipe implements PipeTransform {
  constructor(private readonly sessionsService: SessionsService) {}

  async transform(id: string): Promise<UploadSession> {
    const uploadSession = await this.sessionsService.findUploadSession(id);

    if (!uploadSession) {
      throw new UploadSessionNotFoundException();
    }

    return uploadSession;
  }
}
