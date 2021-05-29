import { IsBoolean, IsOptional } from "class-validator";

export class RemoveInvitationDto {
  @IsBoolean()
  @IsOptional()
  removeDescendants?: boolean;
}
