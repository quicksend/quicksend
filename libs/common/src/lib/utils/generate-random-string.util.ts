import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

export const generateRandomString = (size = 21): string => {
  const generator = customAlphabet(ALPHABET, size);

  return generator();
};
