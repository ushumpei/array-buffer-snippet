import { SyncParser, SyncParseResult } from "../Parser.js";
import { ExifIFDField, Field, IFDParser } from "./IFDParser.js";

export type ZerothIFD = Field[];
export type FirstIFD = Field[];
export type ExifIFD = Field[];
type GPSIFD = unknown;
type TFIFD = unknown;
type Markernote = unknown;

export type IFD = ZerothIFD | FirstIFD | ExifIFD | GPSIFD | TFIFD | Markernote;

export type TiffHeader = {
  offset: number;
  isLittleEndian: boolean;
};

export type PrintIM = unknown;

export type Item = {
  tiffHeader: TiffHeader;
  zerothIFD: ZerothIFD;
  firstIFD?: FirstIFD;
  exifIFD?: ExifIFD;
};

export class ExifParser implements SyncParser<Item> {
  parse(buffer: ArrayBuffer): SyncParseResult<Item> {
    const size = readSegmentSize(buffer);
    if (buffer.byteLength < 2 + size) {
      throw new Error("Illegal State.");
    }

    if (!isExif(buffer)) {
      throw new Error("Illegal State.");
    }

    const tiffHeader = readTiffHeader(buffer);

    const zerothIFD = new IFDParser(tiffHeader).parse(buffer.slice(10));

    const hasFirstIFD = zerothIFD.item.offset > 0;
    let firstIFD: FirstIFD | undefined;
    if (hasFirstIFD) {
      firstIFD = new IFDParser({
        offset: zerothIFD.item.offset,
        isLittleEndian: tiffHeader.isLittleEndian,
      }).parse(buffer.slice(10)).item.fields;
    }

    let exifIFD: ZerothIFD | undefined;
    zerothIFD.item.fields
      .filter((field): field is ExifIFDField => field.tag === 34665)
      .forEach((field) => {
        exifIFD = new IFDParser({
          offset: field.value,
          isLittleEndian: tiffHeader.isLittleEndian,
        }).parse(buffer.slice(10)).item.fields;
      });

    return {
      item: {
        tiffHeader,
        zerothIFD: zerothIFD.item.fields,
        firstIFD,
        exifIFD,
      },
    };
  }
}

const readSegmentSize = (buffer: ArrayBuffer): number => {
  const view = new DataView(buffer, 2, 4);
  return view.getUint16(0);
};

const isExif = (buffer: ArrayBuffer): boolean => {
  const view = new DataView(buffer.slice(4, 10));
  const exifArray = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
  return exifArray.every((v, i) => v === view.getUint8(i));
};

const readTiffHeader = (buffer: ArrayBuffer): TiffHeader => {
  const view = new DataView(buffer.slice(10, 12));
  const offset = new DataView(buffer.slice(14, 18));

  const isBigEndian = view.getUint8(0) === 0x4d && view.getUint8(1) === 0x4d;
  if (isBigEndian) {
    return { offset: offset.getUint32(0, false), isLittleEndian: false };
  }

  const isLittleEndian = view.getUint8(0) === 0x49 && view.getUint8(1) === 0x49;
  if (isLittleEndian) {
    return { offset: offset.getUint32(0, true), isLittleEndian: true };
  }

  throw new Error("Illegal State.");
};
