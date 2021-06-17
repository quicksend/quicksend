import { Controller, UseFilters } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import {
  DeleteTrashPattern,
  FindTrashPattern,
  PostUserDeletePattern,
  PostUserDeletePayload
} from "@quicksend/types";

import { TrashExceptionFilter } from "./trash.filter";
import { TrashService } from "./trash.service";

import { Trash } from "./entities/trash.entity";

import { DeleteTrashPayload } from "./payloads/delete-trash.payload";
import { FindTrashPayload } from "./payloads/find-trash.payload";

@Controller()
@UseFilters(TrashExceptionFilter)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @MessagePattern<DeleteTrashPattern>({
    cmd: "delete-trash",
    service: "files"
  })
  deleteOne(@Payload() payload: DeleteTrashPayload): Promise<Trash> {
    return this.trashService.deleteOne(payload.trash);
  }

  @MessagePattern<FindTrashPattern>({
    cmd: "find-trash",
    service: "files"
  })
  findOne(@Payload() payload: FindTrashPayload): Promise<Trash> {
    return this.trashService.findOne(payload.trash);
  }

  @EventPattern<PostUserDeletePattern>({
    event: "post-user-delete",
    service: "users"
  })
  handleUserDeletion(payload: PostUserDeletePayload): Promise<void> {
    return this.trashService.deleteMany({ owner: payload.user.id });
  }
}
