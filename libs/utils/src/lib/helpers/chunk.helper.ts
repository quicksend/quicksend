export const chunk = {
  string(str: string, size: number): string[] {
    if (size < 1) {
      throw new RangeError("Chunk size cannot be less than 1!");
    }

    if (size > str.length) {
      return [str];
    }

    const chunks = [];

    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }

    return chunks;
  }
};
