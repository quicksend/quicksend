import { Injectable, PipeTransform, Type, mixin } from "@nestjs/common";

import { RequestContext } from "../../common/contexts/request.context";

import { Privileges } from "../../sharing/enums/privileges.enum";

import { FilesService } from "../files.service";
import { SharingService } from "../../sharing/sharing.service";

import { File } from "../entities/file.entity";

import { FileNotFoundException } from "../files.exceptions";
import { InsufficientPrivilegesException } from "../../sharing/sharing.exceptions";

export const FileByIdPipe = (...privileges: Privileges[]): Type<PipeTransform> => {
  @Injectable()
  class FileByIdMixinPipe implements PipeTransform {
    constructor(
      private readonly filesService: FilesService,
      private readonly sharingService: SharingService
    ) {}

    async transform(id: string): Promise<File> {
      const file = await this.filesService.findOne({ id });

      if (!file) {
        throw new FileNotFoundException();
      }

      const user = RequestContext.getItem("user");

      // Owners of the file will always have complete access
      if (user && file.owner.id === user.id) {
        return file;
      }

      // Try to find the closest ancestor with an invitation for the user with the specified privileges
      const hasSufficientPrivileges = await this.sharingService.hasPrivileges({
        path: file.path,
        privileges,
        user
      });

      if (!hasSufficientPrivileges) {
        throw new InsufficientPrivilegesException(...privileges);
      }

      return file;
    }
  }

  return mixin(FileByIdMixinPipe);
};
