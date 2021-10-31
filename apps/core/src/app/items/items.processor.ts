import { Injectable } from "@nestjs/common";
import { InjectQueue, Process, Processor } from "@nestjs/bull";

import { EntityRepository } from "@mikro-orm/postgresql";
import { QueryOrder } from "@mikro-orm/core";

import { Job, Queue } from "bull";

import { LTreeRepository } from "../common/repositories/ltree.repository";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";
import { StorageService } from "../storage/storage.service";

import { Invitation } from "./entities/invitation.entity";
import { Item } from "./entities/item.entity";
import { Version } from "./entities/version.entity";

import { InvitationEvent } from "./events/invitation.event";
import { ItemEvent } from "./events/item.event";
import { VersionEvent } from "./events/version.event";

import { COPY_ITEM, CopyItemJob } from "./jobs/copy-item.job";
import { DELETE_ITEM, DeleteItemJob } from "./jobs/delete-item.job";
import { DELETE_EXPIRED_INVITATIONS } from "./jobs/delete-expired-invitations";
import { DELETE_EXPIRED_ITEMS } from "./jobs/delete-expired-items.job";
import { DELETE_EXPIRED_LOCKS } from "./jobs/delete-expired-locks.job";
import { DELETE_EXPIRED_VERSIONS } from "./jobs/delete-expired-versions.job";

@Injectable()
@Processor(ItemsProcessor.QUEUE_NAME)
export class ItemsProcessor {
  static readonly QUEUE_NAME = "items";

  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService,
    private readonly storageService: StorageService,

    @InjectQueue(ItemsProcessor.QUEUE_NAME)
    private readonly queue: Queue
  ) {}

  private get invitationRepository(): LTreeRepository<Invitation> {
    return this.entityManagerService.getRepository(Invitation);
  }

  private get itemRepository(): LTreeRepository<Item> {
    return this.entityManagerService.getRepository(Item);
  }

  private get versionRepository(): EntityRepository<Version> {
    return this.entityManagerService.getRepository(Version);
  }

  @Process(COPY_ITEM)
  async copyItem(job: Job<CopyItemJob>): Promise<void> {
    const source = await this.itemRepository.findOne({
      id: job.data.source
    });

    if (!source) {
      throw new Error("Source item does not exist");
    }

    const destination = await this.itemRepository.findOne({
      id: job.data.destination
    });

    if (!destination) {
      throw new Error("Destination item does not exist");
    }

    // Copy the deepest descendants last, this way we preserve the hierarchical order as the source tree
    const descendants = await this.itemRepository.streamSubtree(source, (queryBuilder) => {
      queryBuilder.orderBy({
        ["nlevel(path)"]: QueryOrder.ASC
      });
    });

    const total = (await this.itemRepository.countDescendants(source)) + 1;

    let progress = 0;

    for await (const descendant of descendants) {
      const copy = new Item({
        capabilities: descendant.capabilities,
        createdBy: destination.createdBy,
        file: descendant.file,
        folder: descendant.folder,
        name: job.data.name || descendant.name,
        owner: descendant.owner,
        parent: destination
      });

      await this.itemRepository.persistAndFlush(copy);

      this.brokerService.emit(ItemEvent.CREATED, {
        created: copy
      });

      await job.progress(++progress / total);
    }
  }

  @Process(DELETE_ITEM)
  async deleteItem(job: Job<DeleteItemJob>): Promise<void> {
    const item = await this.itemRepository.findOne({
      id: job.data.item
    });

    if (!item) {
      throw new Error("Item does not exists");
    }

    // Delete the deepest descendants first, and work our way up
    const descendants = await this.itemRepository.streamSubtree(item, (queryBuilder) => {
      queryBuilder.orderBy({
        ["nlevel(path)"]: QueryOrder.DESC
      });
    });

    const total = (await this.itemRepository.countDescendants(item)) + 1;

    let progress = 0;

    for await (const descendant of descendants) {
      await this.invitationRepository.removeSubtree(descendant.path);

      await this.versionRepository.nativeDelete({
        item: descendant.id
      });

      await this.itemRepository.nativeDelete({
        id: descendant.id
      });

      if (descendant.file) {
        const count = await this.itemRepository.count({
          file: descendant.file
        });

        if (count <= 0) {
          await this.storageService.deleteOne({
            id: descendant.file.id
          });
        }
      }

      this.brokerService.emit(ItemEvent.DELETED, {
        deleted: descendant
      });

      await job.progress(++progress / total);
    }
  }

  @Process(DELETE_EXPIRED_ITEMS)
  async deleteExpiredItems(): Promise<void> {
    // Find expired items that are not marked for deletion
    const items: AsyncIterable<Item> = await this.itemRepository
      .createQueryBuilder()
      .select("*")
      .where({
        deletedAt: null,
        expiresAt: {
          $lte: new Date()
        }
      })
      .getKnexQuery()
      .stream();

    for await (const item of items) {
      item.deletedAt = new Date();

      await this.itemRepository.persistAndFlush(item);

      await this.queue.add(DELETE_ITEM, {
        item
      });

      this.brokerService.emit(ItemEvent.DELETED, {
        deleted: item
      });
    }
  }

  @Process(DELETE_EXPIRED_INVITATIONS)
  async deleteExpiredInvitations(): Promise<void> {
    const invitations: AsyncIterable<Invitation> = await this.invitationRepository
      .createQueryBuilder()
      .select("*")
      .where({
        expiresAt: {
          $lte: new Date()
        }
      })
      .getKnexQuery()
      .stream();

    for await (const invitation of invitations) {
      await this.invitationRepository.removeAndFlush(invitation);

      this.brokerService.emit(InvitationEvent.RESCINDED, {
        deleted: invitation
      });
    }
  }

  @Process(DELETE_EXPIRED_LOCKS)
  async deleteExpiredLocks(): Promise<void> {
    const items: AsyncIterable<Item> = await this.itemRepository
      .createQueryBuilder()
      .select("*")
      .where({
        lock: {
          expiresAt: {
            $lte: new Date()
          }
        }
      })
      .getKnexQuery()
      .stream();

    for await (const item of items) {
      item.lock = undefined;

      await this.itemRepository.persistAndFlush(item);

      this.brokerService.emit(ItemEvent.UNLOCKED, {
        unlocked: item
      });
    }
  }

  @Process(DELETE_EXPIRED_VERSIONS)
  async deleteExpiredVersions(): Promise<void> {
    const versions: AsyncIterable<Version> = await this.versionRepository
      .createQueryBuilder()
      .select("*")
      .where({
        expiresAt: {
          $lte: new Date()
        }
      })
      .getKnexQuery()
      .stream();

    for await (const version of versions) {
      await this.versionRepository.removeAndFlush(version);

      this.brokerService.emit(VersionEvent.DELETED, {
        deleted: version
      });
    }
  }
}
