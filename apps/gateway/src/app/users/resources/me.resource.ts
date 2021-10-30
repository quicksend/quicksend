import { Profile } from "./profile.resource";

export class Me {
  createdAt!: Date;

  email?: string;

  id!: string;

  profile?: Profile;

  username!: string;
}
