import { IsBoolean } from "class-validator";

export class UpdateFilePublicityDto {
  @IsBoolean()
  isPublic!: boolean;
}
