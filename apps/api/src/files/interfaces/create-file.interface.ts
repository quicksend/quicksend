import { WrittenFile } from "@quicksend/multiparter";

import { FileEntity } from "../file.entity";

export interface CreateFile {
  file: {
    name: FileEntity["name"];
    parent: FileEntity["parent"];
    user: FileEntity["user"];
  };

  item: {
    discriminator: WrittenFile["discriminator"];
    hash: WrittenFile["hash"];
    size: WrittenFile["size"];
  };
}
