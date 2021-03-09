import { BaseResponseBody } from "./base-response-body.interface";

export type Error = {
  message: string;
  type: string;
};

export interface HttpExceptionResponseBody<T = Error> extends BaseResponseBody {
  error: T;
}
