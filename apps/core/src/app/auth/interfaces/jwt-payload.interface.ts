export interface JwtPayload {
  [key: string]: unknown;

  user: string;
}
