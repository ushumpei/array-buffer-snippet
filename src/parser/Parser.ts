export type ParseResult<T> = {
  done: boolean;
  item: T;
};
export interface Parser<T> {
  parse: (buffer: ArrayBuffer) => ParseResult<T>;
}

export type SyncParseResult<T> = {
  item: T;
};
export interface SyncParser<T> {
  parse: (buffer: ArrayBuffer) => SyncParseResult<T>;
}

export const mergeBuffers = (b1: ArrayBuffer, b2: ArrayBuffer): ArrayBuffer => {
  const a = new Uint8Array(b1.byteLength + b2.byteLength);
  a.set(new Uint8Array(b1), 0);
  a.set(new Uint8Array(b2), b1.byteLength);
  return a.buffer;
};

export const bufferToAscii = (buffer: ArrayBuffer): string => {
  // 注意: console.log で \x00 が消えるので、ぱっと見同じなのに等値比較がうまくいかない時は \x00 が紛れていたりする.
  return Array.from(new Uint8Array(buffer))
    .map((b: number) => String.fromCharCode(b))
    .join("");
};
