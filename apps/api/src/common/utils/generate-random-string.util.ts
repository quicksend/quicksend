import { customAlphabet } from "nanoid/async";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

export const generateRandomString = (size = 21): Promise<string> => {
  const generator = customAlphabet(ALPHABET, size);

  return generator();
};
