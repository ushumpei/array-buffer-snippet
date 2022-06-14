export declare type ParseResult<T> = {
    done: boolean;
    item: T;
};
export interface Parser<T> {
    parse: (buffer: ArrayBuffer) => ParseResult<T>;
}
export declare type SyncParseResult<T> = {
    item: T;
};
export interface SyncParser<T> {
    parse: (buffer: ArrayBuffer) => SyncParseResult<T>;
}
export declare const mergeBuffers: (b1: ArrayBuffer, b2: ArrayBuffer) => ArrayBuffer;
export declare const bufferToAscii: (buffer: ArrayBuffer) => string;
