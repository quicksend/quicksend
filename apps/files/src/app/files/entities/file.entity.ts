import {
  BeforeCreate,
  BigIntType,
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
  Unique
} from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { MaxLength, Min, validateOrReject } from "class-validator";

import { File as IFile, FileCapabilities } from "@quicksend/types";
import { LTreeEntity, LTreeRepository, generateRandomString } from "@quicksend/common";

@Entity({ customRepository: () => LTreeRepository })
@Unique({ properties: ["name", "parent"] })
@Unique({ properties: ["owner", "path"] })
export class File implements LTreeEntity, IFile {
  [EntityRepositoryType]?: LTreeRepository<File>;

  @Min(0)
  @Property({ unsigned: true })
  capabilities: number = 0;

  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @Property({ nullable: true })
  hash?: string;

  @PrimaryKey()
  id: string = generateRandomString();

  @MaxLength(255)
  @Property({ length: 255 })
  name!: string;

  @Property()
  owner!: string;

  @Exclude()
  @ManyToOne(() => File, {
    nullable: true,
    wrappedReference: true
  })
  parentRef?: IdentifiedReference<File>;

  // https://www.postgresql.org/docs/current/ltree.html
  @Exclude()
  @Index({ type: "gist" })
  @Property({ columnType: "ltree" })
  path!: string;

  @Min(0)
  @Property({ unsigned: true })
  size: number = 0;

  constructor(parent?: File) {
    this.parentRef = parent && Reference.create(parent);
  }

  @Property({ persist: false })
  get isRoot(): boolean {
    return this.name === "/" && !this.parentRef;
  }

  @Property({ persist: false })
  get isTrashBin(): boolean {
    return this.name === "trash" && !this.parentRef;
  }

  @Property({ persist: false })
  get parent(): string | undefined {
    return this.parentRef?.id;
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }

  hasCapabilities(...capabalities: FileCapabilities[]): boolean {
    return capabalities.every((capability) => (this.capabilities & capability) === capability);
  }

  setCapabilities(...capabilities: FileCapabilities[]): this {
    this.capabilities = capabilities.reduce((a, b) => a | b);

    return this;
  }

  setParent(parent: File): this {
    this.parentRef = Reference.create(parent);

    return this;
  }
}
