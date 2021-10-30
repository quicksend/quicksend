import { Profile } from "./profile.resource";

export class User {
  createdAt!: Date;

  id!: string;

  profile?: Profile;

  username!: string;
}
