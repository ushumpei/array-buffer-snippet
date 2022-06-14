import { ZerothIFD, TiffHeader, FirstIFD, ExifIFD } from "./ExifParser.js";
import { Parser, ParseResult } from "../Parser.js";
import { Marker, SOFMarker } from "./Marker.js";
export declare const enum Type {
    S = "Segment",
    D = "Data"
}
export declare type Data = {
    t: Type.D;
    data: ArrayBuffer;
};
export declare type SOFSegment = {
    t: Type.S;
    marker: SOFMarker;
    size: number;
    x: number;
    y: number;
};
export declare type ExifSegment = {
    t: Type.S;
    marker: Marker.APP1;
    size: number;
    tiffHeader: TiffHeader;
    zerothIFD: ZerothIFD;
    firstIFD?: FirstIFD;
    exifIFD?: ExifIFD;
};
export declare type Segment = {
    t: Type.S;
    marker: Marker.SOI | Marker.EOI;
} | {
    t: Type.S;
    marker: Marker.SOS;
    size: number;
    parameter: ArrayBuffer;
} | {
    t: Type.S;
    marker: string;
    size: number;
    parameter: ArrayBuffer;
} | SOFSegment | ExifSegment;
export declare type Item = Segment | Data;
export declare class JpegParser implements Parser<Item[]> {
    buffer: ArrayBuffer;
    constructor();
    parse(buffer: ArrayBuffer): ParseResult<Item[]>;
}
