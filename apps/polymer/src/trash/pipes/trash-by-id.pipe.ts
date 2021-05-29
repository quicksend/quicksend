import { Injectable, PipeTransform } from "@nestjs/common";

import { RequestContext } from "../../common/contexts/request.context";

import { TrashService } from "../trash.service";

import { Trash } from "../entities/trash.entity";

import { TrashNotFoundException } from "../trash.exceptions";

@Injectable()
export class TrashByIdPipe implements PipeTransform {
  constructor(private readonly trashService: TrashService) {}

  async transform(id: string): Promise<Trash> {
    const user = RequestContext.getItem("user");

    if (!user) {
      throw new TrashNotFoundException();
    }

    const trash = await this.trashService.findOne({
      id,
      owner: user
    });

    if (!trash) {
      throw new TrashNotFoundException();
    }

    return trash;
  }
}
