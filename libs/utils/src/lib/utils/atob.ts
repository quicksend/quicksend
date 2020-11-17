export const atob = (str: string): string =>
  Buffer.from(str, "base64").toString("binary");
