import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { File } from "@quicksend/transmit";

import { Queue } from "bull";
import { Readable } from "stream";

import { LTreeRepository } from "../common/repositories/ltree.repository";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";
import { StorageService } from "../storage/storage.service";
import { UsersService } from "../users/users.service";

import { ItemsProcessor } from "./items.processor";

import { Capabilities } from "./embeddables/capabilities.embeddable";
import { Lock } from "./embeddables/lock.embeddable";
import { Trash } from "./embeddables/trash.embeddable";

import { Invitation } from "./entities/invitation.entity";
import { Item } from "./entities/item.entity";
import { Version } from "./entities/version.entity";

import { InvitationRole } from "./enums/invitation-role.enum";

import { InvitationEvent } from "./events/invitation.event";
import { ItemEvent } from "./events/item.event";
import { VersionEvent } from "./events/version.event";

import { AsyncJob } from "./interfaces/async-job.interface";
import { AsyncJobStatus } from "./interfaces/async-job-status.interface";

import { COPY_ITEM } from "./jobs/copy-item.job";
import { DELETE_ITEM } from "./jobs/delete-item.job";

import {
  AsyncJobNotFoundException,
  InsufficientPrivilegesException,
  InvitationNotFoundException,
  InvitationConflictException,
  InvitedByAncestorException,
  InviteeCannotBeInviterException,
  InviteeCannotBeOwnerException,
  InviteeNotFoundException,
  ItemConflictException,
  ItemOperationNotPermittedException,
  ItemLockedByUserException,
  ItemNotFoundException,
  ItemNotTrashedException,
  LockCannotBeRemovedByUserException,
  LockNotFoundException,
  VersionNotFoundException
} from "./items.exceptions";

@Injectable()
export class ItemsService {
  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService,
    private readonly storageService: StorageService,
    private readonly usersService: UsersService,

    @InjectQueue(ItemsProcessor.QUEUE_NAME)
    private readonly itemsProcessor: Queue
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

  /**
   * Create a copy of an item including its descendants. Returns an ID to monitor the progress of the job.
   */
  async copyItem(
    from: FilterQuery<Item>,
    to: FilterQuery<Item>,
    options: {
      copiedBy: string;
      name?: string;
    }
  ): Promise<AsyncJob> {
    const source = await this.findItem(from, {
      role: InvitationRole.READER,
      user: options.copiedBy
    });

    if (!source.capabilities.canCopy) {
      throw new ItemOperationNotPermittedException(source.name);
    }

    const destination = await this.findItem(to, {
      role: InvitationRole.WRITER,
      user: options.copiedBy
    });

    if (!destination.capabilities.canAddChildren) {
      throw new ItemOperationNotPermittedException(destination.name);
    }

    if (destination.lock && destination.lock.createdBy !== options.copiedBy) {
      throw new ItemLockedByUserException(destination.name, destination.lock.createdBy);
    }

    const duplicate = await this.itemRepository.findOne({
      name: options.name || source.name,
      parent: destination
    });

    if (duplicate) {
      throw new ItemConflictException(source.name, destination.name);
    }

    const job = await this.itemsProcessor.add(COPY_ITEM, {
      destination: destination.id,
      name: options.name,
      source: source.id
    });

    return {
      jobId: String(job.id)
    };
  }

  /**
   * Create a file for the given uploaded file metadata. Files must be a descendant of a folder.
   *
   * @emits ItemEvent.CREATED
   */
  async createFile(
    uploadedFile: File,
    data: {
      capabilities: Partial<Capabilities>;
      expiresAt?: Date;
      name?: string;
      parent: FilterQuery<Item>;
      uploadedBy: string;
    }
  ): Promise<Item> {
    const parent = await this.findItem(data.parent, {
      role: InvitationRole.WRITER,
      user: data.uploadedBy
    });

    if (!parent.capabilities.canAddChildren || !parent.folder) {
      throw new ItemOperationNotPermittedException(parent.name);
    }

    const file = await this.storageService.create(uploadedFile);

    const item = new Item({
      capabilities: data.capabilities,
      createdBy: data.uploadedBy,
      expiresAt: data.expiresAt,
      file,
      name: data.name || uploadedFile.name,
      owner: parent.owner,
      parent
    });

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: data.uploadedBy
    });

    await this.brokerService.emitAsync(ItemEvent.CREATED, {
      created: item
    });

    return item;
  }

  /**
   * Create a folder as a descendant of an existing item.
   *
   * @emits ItemEvent.CREATED
   */
  async createFolder(data: {
    capabilities: Partial<Capabilities>;
    createdBy: string;
    expiresAt?: Date;
    name: string;
    parent: FilterQuery<Item>;
  }): Promise<Item> {
    const parent = await this.findItem(data.parent, {
      role: InvitationRole.WRITER,
      user: data.createdBy
    });

    if (!parent.capabilities.canAddChildren) {
      throw new ItemOperationNotPermittedException(parent.name);
    }

    if (parent.lock && parent.lock.createdBy !== data.createdBy) {
      throw new ItemLockedByUserException(parent.name, parent.lock.createdBy);
    }

    const item = new Item({
      capabilities: data.capabilities,
      createdBy: data.createdBy,
      expiresAt: data.expiresAt,
      folder: {
        size: 0
      },
      name: data.name,
      owner: parent.owner,
      parent
    });

    const duplicate = await this.itemRepository.findOne({
      name: item.name,
      parent: item.parent
    });

    if (duplicate) {
      throw new ItemConflictException(data.name, parent.name);
    }

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item);

    await this.brokerService.emitAsync(ItemEvent.CREATED, {
      created: item
    });

    return item;
  }

  /**
   * Create an invitation for an item. Items will implicitly inherit its ancestor's invitations.
   *
   * @emits InvitationEvent.CREATED
   */
  async createInvitation(
    filter: FilterQuery<Item>,
    options: {
      expiresAt?: Date;
      invitee: string;
      inviter: string;
      message?: string;
      notifyInvitee?: boolean;
      role: InvitationRole;
    }
  ): Promise<Invitation> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.inviter
    });

    if (!item.capabilities.canShare) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    const invitee = await this.usersService.findOne({
      id: options.invitee
    });

    if (!invitee) {
      throw new InviteeNotFoundException();
    }

    if (item.owner === options.invitee) {
      throw new InviteeCannotBeOwnerException();
    }

    if (options.inviter === options.invitee) {
      throw new InviteeCannotBeInviterException();
    }

    const duplicate = await this.invitationRepository.findOne({
      invitee: options.invitee,
      path: item.path
    });

    if (duplicate) {
      throw new InvitationConflictException();
    }

    const inherited = await this.invitationRepository.findClosestAncestor(item.path, (qb) => {
      qb.andWhere({
        invitee: options.invitee
      });
    });

    if (inherited) {
      throw new InvitedByAncestorException();
    }

    const invitation = new Invitation({
      ...options,
      createdBy: options.inviter,
      path: item.path
    });

    await this.invitationRepository.persistAndFlush(invitation);

    await this.brokerService.emitAsync(InvitationEvent.CREATED, {
      created: invitation
    });

    return invitation;
  }

  /**
   * Create a root folder for an user.
   *
   * @emits ItemEvent.CREATED
   */
  async createRootFolder(data: {
    capabilities: Partial<Capabilities>;
    createdBy: string;
    expiresAt?: Date;
    name: string;
  }): Promise<Item> {
    const item = new Item({
      capabilities: data.capabilities,
      createdBy: data.createdBy,
      expiresAt: data.expiresAt,
      folder: {
        size: 0
      },
      name: data.name,
      owner: data.createdBy
    });

    const duplicate = await this.itemRepository.findOne({
      name: item.name,
      parent: item.parent
    });

    if (duplicate) {
      throw new ItemConflictException(data.name, `@${data.createdBy}`);
    }

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item);

    await this.brokerService.emitAsync(ItemEvent.CREATED, {
      created: item
    });

    return item;
  }

  /**
   * Create a version of the current item.
   *
   * @emits VersionEvent.CREATED
   */
  async createVersion(
    item: Item,
    options?: {
      createdAt?: Date;
      createdBy?: string;
      expiresAt?: Date;
      name?: string;
    }
  ): Promise<Version> {
    const version = Version.from(item, options);

    await this.versionRepository.persistAndFlush(version);

    await this.brokerService.emitAsync(VersionEvent.CREATED, {
      created: version
    });

    return version;
  }

  /**
   * Mark a trashed item as deleted and add the item to the deletion queue.
   */
  async deleteItem(
    filter: FilterQuery<Item>,
    options: {
      deletedBy: string;
    }
  ): Promise<Item> {
    const item = await this.itemRepository.findOne(filter);

    if (!item) {
      throw new ItemNotFoundException();
    }

    if (!item.trash) {
      throw new ItemNotTrashedException(item.name);
    }

    // Only owners can permanently delete an item
    if (item.owner !== options.deletedBy) {
      throw new InsufficientPrivilegesException(item.name);
    }

    if (!item.capabilities.canDelete) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    const parent = await item.parent?.load();

    if (parent && !parent.capabilities.canDeleteChildren) {
      throw new ItemOperationNotPermittedException(parent.name);
    }

    const deletedAt = new Date();

    item.deletedAt = deletedAt;
    item.expiresAt = undefined;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item);

    await this.itemRepository.updateDescendants(item, {
      deletedAt,
      expiresAt: null
    });

    await this.itemsProcessor.add(DELETE_ITEM, {
      item: item.id
    });

    return item;
  }

  /**
   * Finds an invitation of an item.
   */
  async findInvitation(
    filter: FilterQuery<Item>,
    options: {
      invitation: string;
      user: string;
    }
  ): Promise<Invitation> {
    const item = await this.findItem(filter, {
      role: InvitationRole.READER,
      user: options.user
    });

    const invitation = await this.invitationRepository.findOne({
      id: options.invitation,
      path: item.path
    });

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    return invitation;
  }

  /**
   * Find an item accessible by the user if their role is at least the given role.
   */
  async findItem(
    filter: FilterQuery<Item>,
    options: {
      role?: InvitationRole;
      user: string;
    }
  ): Promise<Item> {
    const item = await this.itemRepository.findOne(filter);

    if (!item) {
      throw new ItemNotFoundException();
    }

    // Owners always have full access to their items
    if (item.owner === options.user) {
      return item;
    }

    const invitation = await this.invitationRepository.findClosestAncestor(item.path, (qb) => {
      qb.andWhere({
        invitee: options.user,
        role: {
          $gte: options.role
        }
      });
    });

    if (!invitation) {
      throw new InsufficientPrivilegesException(item.name);
    }

    return item;
  }

  /**
   * Lists all versions of an item
   */
  async listVersions(
    filter: FilterQuery<Item>,
    options: {
      user: string;
    }
  ): Promise<Version[]> {
    const item = await this.findItem(filter, {
      user: options.user
    });

    return this.versionRepository.find({
      item
    });
  }

  /**
   * Lock a item and its descendants to prevent editing by other users except the lock holder.
   *
   * @emits ItemEvent.LOCKED
   */
  async lockItem(
    filter: FilterQuery<Item>,
    options: {
      expiresAt?: Date;
      lockedBy: string;
      reason?: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.lockedBy
    });

    if (!item.capabilities.canLock) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    item.lock = new Lock({
      createdBy: options.lockedBy,
      expiresAt: options.expiresAt,
      reason: options.reason
    });

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.lockedBy
    });

    await this.brokerService.emitAsync(ItemEvent.LOCKED, {
      locked: item
    });

    return item;
  }

  /**
   * Monitor the progress of an async job for an item operation.
   */
  async monitorAsyncJob(jobId: string): Promise<AsyncJobStatus> {
    const job = await this.itemsProcessor.getJob(jobId);

    if (!job) {
      throw new AsyncJobNotFoundException(jobId);
    }

    return {
      progress: job.progress(),
      total: 1
    };
  }

  /**
   * Move an item and its descendants to a new parent.
   *
   * @emits ItemEvent.MOVED
   */
  async moveItem(
    from: FilterQuery<Item>,
    to: FilterQuery<Item>,
    options: {
      movedBy: string;
    }
  ): Promise<Item> {
    const source = await this.findItem(from, {
      role: InvitationRole.WRITER,
      user: options.movedBy
    });

    if (!source.capabilities.canMove) {
      throw new ItemOperationNotPermittedException(source.name);
    }

    if (source.lock && source.lock.createdBy !== options.movedBy) {
      throw new ItemLockedByUserException(source.name, source.lock.createdBy);
    }

    const destination = await this.findItem(to, {
      role: InvitationRole.WRITER,
      user: options.movedBy
    });

    if (!destination.capabilities.canAddChildren) {
      throw new ItemOperationNotPermittedException(destination.name);
    }

    if (destination.lock && destination.lock.createdBy !== options.movedBy) {
      throw new ItemLockedByUserException(destination.name, destination.lock.createdBy);
    }

    const duplicate = await this.itemRepository.findOne({
      name: source.name,
      parent: destination
    });

    if (duplicate) {
      throw new ItemConflictException(source.name, destination.name);
    }

    source.setParent(destination);

    await this.itemRepository.persistAndFlush(source);

    await this.createVersion(source, {
      createdBy: options.movedBy
    });

    await this.itemRepository.moveSubtree(source, destination);

    await this.brokerService.emitAsync(ItemEvent.MOVED, {
      destination,
      source
    });

    return source;
  }

  /**
   * Create a readable stream of a file's contents.
   */
  async readFile(
    filter: FilterQuery<Item>,
    options: {
      user: string;
    }
  ): Promise<Readable> {
    const item = await this.findItem(filter, {
      role: InvitationRole.READER,
      user: options.user
    });

    if (!item.capabilities.canDownload || !item.file) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    return this.storageService.stream(item.file.id);
  }

  /**
   * Rename an item with the given name.
   *
   * @emits ItemEvent.RENAMED
   */
  async renameItem(
    filter: FilterQuery<Item>,
    options: {
      newName: string;
      renamedBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.renamedBy
    });

    if (!item.capabilities.canRename) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock && item.lock.createdBy !== options.renamedBy) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    const duplicate = await this.itemRepository.findOne({
      name: options.newName,
      parent: item.parent
    });

    if (duplicate) {
      const parent = await item.parent?.load();

      throw new ItemConflictException(options.newName, parent ? parent.name : "root");
    }

    item.name = options.newName;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.renamedBy
    });

    await this.brokerService.emitAsync(ItemEvent.RENAMED, {
      renamed: item
    });

    return item;
  }

  /**
   * Rescind an invitation to an item including its descendants.
   *
   * @emits InvitationEvent.RESCINDED
   */
  async rescindInvitation(
    filter: FilterQuery<Item>,
    options: {
      invitation: string;
      rescindedBy: string;
    }
  ): Promise<Invitation> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.rescindedBy
    });

    const invitation = await this.invitationRepository.findOne({
      id: options.invitation,
      path: item.path
    });

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    await this.invitationRepository.removeSubtree(invitation);

    await this.brokerService.emitAsync(InvitationEvent.RESCINDED, {
      rescinded: invitation
    });

    return invitation;
  }

  /**
   * Restore an item to a previous version.
   *
   * @emits ItemEvent.RESTORED
   */
  async restoreItem(
    filter: FilterQuery<Item>,
    options: {
      restoreTo: string;
      restoredBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.restoredBy
    });

    if (!item.capabilities.canRestore) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    const version = await this.versionRepository.findOne({
      id: options.restoreTo,
      item
    });

    if (!version) {
      throw new VersionNotFoundException(options.restoreTo);
    }

    item.capabilities = version.snapshot.capabilities;
    item.lock = version.snapshot.lock;
    item.name = version.snapshot.name;
    item.owner = version.snapshot.owner;
    item.trash = version.snapshot.trash;

    if (version.snapshot.parent) {
      const parent = await this.itemRepository.findOne(version.snapshot.parent);

      if (parent) {
        item.setParent(parent);
      }
    }

    await this.itemRepository.persistAndFlush(item);

    await this.brokerService.emitAsync(ItemEvent.RESTORED, {
      restored: item
    });

    return item;
  }

  /**
   * Transfer the ownership of an item to another user.
   *
   * @emits ItemEvent.TRANSFERRED
   */
  async transferItem(
    filter: FilterQuery<Item>,
    options: {
      newOwner: string;
      transferredBy: string;
    }
  ): Promise<Item> {
    const item = await this.itemRepository.findOne(filter);

    if (!item) {
      throw new ItemNotFoundException();
    }

    // Only owners can transfer
    if (item.owner !== options.transferredBy) {
      throw new InsufficientPrivilegesException(item.name);
    }

    if (!item.capabilities.canTransfer) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock && item.lock.createdBy !== options.transferredBy) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    item.owner = options.newOwner;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.transferredBy
    });

    await this.brokerService.emitAsync(ItemEvent.TRANSFERRED, {
      transferred: item
    });

    return item;
  }

  /**
   * Mark an item and its descendants as trash.
   *
   * @emits ItemEvent.TRASHED
   */
  async trashItem(
    filter: FilterQuery<Item>,
    options: {
      autoDeleteOn?: Date;
      trashedBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.CO_OWNER,
      user: options.trashedBy
    });

    if (!item.capabilities.canTrash) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock && item.lock.createdBy !== options.trashedBy) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    const parent = await item.parent?.load();

    if (parent && !parent.capabilities.canTrashChildren) {
      throw new ItemOperationNotPermittedException(parent.name);
    }

    const trash = new Trash({
      createdBy: options.trashedBy
    });

    item.expiresAt = options.autoDeleteOn;
    item.trash = trash;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.trashedBy
    });

    await this.itemRepository.updateDescendants(item, {
      expiresAt: options.autoDeleteOn,
      trash
    });

    await this.brokerService.emitAsync(ItemEvent.TRASHED, {
      trashed: item
    });

    return item;
  }

  /**
   * Unlock an item. Only the lock holder or item owner can release a lock.
   *
   * @emits ItemEvent.UNLOCKED
   */
  async unlockItem(
    filter: FilterQuery<Item>,
    options: {
      unlockedBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.unlockedBy
    });

    if (!item.lock) {
      throw new LockNotFoundException(item.name);
    }

    // Owners will always be able to unlock their items regardless of who holds a lock on it
    if (item.owner !== options.unlockedBy && item.lock.createdBy !== options.unlockedBy) {
      throw new LockCannotBeRemovedByUserException(item.name);
    }

    item.lock = undefined;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.unlockedBy
    });

    await this.brokerService.emitAsync(ItemEvent.UNLOCKED, {
      unlocked: item
    });

    return item;
  }

  /**
   * Remove all invitations for the given item including its descendants.
   *
   * @emits ItemEvent.UNSHARED
   */
  async unshareItem(
    filter: FilterQuery<Item>,
    options: {
      unsharedBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.WRITER,
      user: options.unsharedBy
    });

    if (!item.capabilities.canUnshare) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    await this.invitationRepository.removeSubtree(item.path);

    await this.brokerService.emitAsync(ItemEvent.UNSHARED, {
      unshared: item
    });

    return item;
  }

  /**
   * Unmark an item and its descendants as trash.
   *
   * @emits ItemEvent.UNTRASHED
   */
  async untrashItem(
    filter: FilterQuery<Item>,
    options: {
      untrashedBy: string;
    }
  ): Promise<Item> {
    const item = await this.findItem(filter, {
      role: InvitationRole.CO_OWNER,
      user: options.untrashedBy
    });

    if (!item.trash) {
      throw new ItemNotTrashedException(item.name);
    }

    if (!item.capabilities.canUntrash) {
      throw new ItemOperationNotPermittedException(item.name);
    }

    if (item.lock && item.lock.createdBy !== options.untrashedBy) {
      throw new ItemLockedByUserException(item.name, item.lock.createdBy);
    }

    item.trash = undefined;

    await this.itemRepository.persistAndFlush(item);

    await this.createVersion(item, {
      createdBy: options.untrashedBy
    });

    await this.itemRepository.updateDescendants(item, {
      trash: null
    });

    await this.brokerService.emitAsync(ItemEvent.UNTRASHED, {
      untrashed: item
    });

    return item;
  }
}
