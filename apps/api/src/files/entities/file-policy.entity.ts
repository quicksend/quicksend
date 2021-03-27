import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { BaseEntity } from "../../common/entities/base.entity";

import { FilePolicyLevelsEnum } from "../enums/file-policies-levels.enum";

import { FileEntity } from "../file.entity";
import { UserEntity } from "../../user/user.entity";

@Entity("file_policy")
export class FilePolicyEntity extends BaseEntity {
  @JoinColumn()
  @OneToOne(() => UserEntity, {
    eager: true,
    nullable: false
  })
  beneficiary!: UserEntity;

  @ManyToOne(() => FileEntity, (file) => file.policies, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE"
  })
  file!: FileEntity;

  @Column({
    default: FilePolicyLevelsEnum.READ_FILE,
    enum: FilePolicyLevelsEnum,
    nullable: false,
    type: "enum"
  })
  level!: FilePolicyLevelsEnum;
}
