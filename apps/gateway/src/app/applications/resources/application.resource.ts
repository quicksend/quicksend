import { Scope } from "../enums/scope.enum";

export class Application {
  createdAt!: Date;

  id!: string;

  name!: string;

  owner!: string;

  scopes!: Scope[];

  secret!: string;
}
