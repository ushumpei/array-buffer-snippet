import { SyncParser, SyncParseResult } from "../Parser.js";
import { Field } from "./IFDParser.js";
export declare type ZerothIFD = Field[];
export declare type FirstIFD = Field[];
export declare type ExifIFD = Field[];
declare type GPSIFD = unknown;
declare type TFIFD = unknown;
declare type Markernote = unknown;
export declare type IFD = ZerothIFD | FirstIFD | ExifIFD | GPSIFD | TFIFD | Markernote;
export declare type TiffHeader = {
    offset: number;
    isLittleEndian: boolean;
};
export declare type PrintIM = unknown;
export declare type Item = {
    tiffHeader: TiffHeader;
    zerothIFD: ZerothIFD;
    firstIFD?: FirstIFD;
    exifIFD?: ExifIFD;
};
export declare class ExifParser implements SyncParser<Item> {
    parse(buffer: ArrayBuffer): SyncParseResult<Item>;
}
export {};
