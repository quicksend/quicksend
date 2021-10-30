import { IsNotEmpty, IsString } from "class-validator";

export class ExchangePasswordPayload {
  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;
}
