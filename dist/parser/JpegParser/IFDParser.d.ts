import { SyncParser, SyncParseResult } from "../Parser.js";
declare const enum TypeName {
    "BYTE" = 1,
    "ASCII" = 2,
    "SHORT" = 3,
    "LONG" = 4,
    "RATIONAL" = 5,
    "SBYTE" = 6,
    "UNDEFINED" = 7,
    "SSHORT" = 8,
    "SLONG" = 9,
    "SRATIONAL" = 10,
    "FLOAT" = 11,
    "DFLOAT" = 12
}
declare type Type = {
    name: TypeName;
    size: number;
};
export declare type ExifIFDField = {
    tag: number;
    type: Type;
    count: number;
    value: number;
};
export declare type Field = {
    tag: number;
    type: Type;
    count: number;
    value: string | number | (string | number)[] | undefined;
};
export declare type IFD = {
    count: number;
    fields: (Field | ExifIFDField)[];
    offset: number;
};
export declare class IFDParser implements SyncParser<IFD> {
    config: {
        offset: number;
        isLittleEndian: boolean;
    };
    constructor(config: {
        offset: number;
        isLittleEndian: boolean;
    });
    parse(buffer: ArrayBuffer): SyncParseResult<IFD>;
}
export {};
