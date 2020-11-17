export const btoa = (data: Buffer | string): string =>
  (data instanceof Buffer ? data : Buffer.from(data, "binary")).toString(
    "base64"
  );
