import { IsNotEmpty, IsString } from "class-validator";

export class UnshareFileDto {
  @IsNotEmpty()
  @IsString()
  beneficiary!: string;
}
