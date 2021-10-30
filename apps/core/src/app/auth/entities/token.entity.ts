import { Entity, Enum, PrimaryKey, Property, Unique } from "@mikro-orm/core";

import { TokenType } from "../enum/token-type.enum";

@Entity()
@Unique<Token>({
  properties: ["type", "value"]
})
export class Token {
  @Property()
  createdAt: Date;

  @Property()
  expiresAt?: Date;

  @Enum(() => TokenType)
  type: TokenType;

  @PrimaryKey()
  value: string;

  // prettier-ignore
  constructor(token: {
    createdAt?: Date;
    expiresAt?: Date;
    type: TokenType;
    value: string;
  }) {
    this.createdAt = token.createdAt || new Date();
    this.expiresAt = token.expiresAt
    this.type = token.type;
    this.value = token.value;
  }
}
