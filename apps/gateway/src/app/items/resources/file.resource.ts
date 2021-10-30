import { Infection } from "./infection.resource";

export class File {
  hash!: string;

  infection?: Infection;

  mimetype?: string;

  size!: number;
}
