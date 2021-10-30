import { IsNotEmpty, IsString } from "class-validator";

export class RescindInvitationPayload {
  @IsNotEmpty()
  @IsString()
  invitation!: string;

  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  rescindedBy!: string;
}
