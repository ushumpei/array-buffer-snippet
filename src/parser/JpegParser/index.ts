import {
  ExifParser,
  ZerothIFD,
  TiffHeader,
  FirstIFD,
  ExifIFD,
} from "./ExifParser.js";
import { mergeBuffers, Parser, ParseResult } from "../Parser.js";
import {
  isAPP1,
  isSOF,
  Marker,
  readSegmentMarker,
  SOFMarker,
} from "./Marker.js";

export const enum Type {
  S = "Segment",
  D = "Data",
}

export type Data = {
  t: Type.D;
  data: ArrayBuffer;
};

export type SOFSegment = {
  t: Type.S;
  marker: SOFMarker;
  size: number;
  x: number;
  y: number;
};

export type ExifSegment = {
  t: Type.S;
  marker: Marker.APP1;
  size: number;
  tiffHeader: TiffHeader;
  zerothIFD: ZerothIFD;
  firstIFD?: FirstIFD;
  exifIFD?: ExifIFD;
};

export type Segment =
  | {
      t: Type.S;
      marker: Marker.SOI | Marker.EOI;
    }
  | {
      t: Type.S;
      marker: Marker.SOS;
      size: number;
      parameter: ArrayBuffer;
    }
  | {
      t: Type.S;
      marker: string;
      size: number;
      parameter: ArrayBuffer;
    }
  | SOFSegment
  | ExifSegment;

export type Item = Segment | Data;

export class JpegParser implements Parser<Item[]> {
  buffer: ArrayBuffer;

  constructor() {
    this.buffer = new ArrayBuffer(0);
  }

  parse(buffer: ArrayBuffer): ParseResult<Item[]> {
    this.buffer = mergeBuffers(this.buffer, buffer);

    const [remainingBuffer, segments] = parseSegments(this.buffer, []);
    this.buffer = remainingBuffer;

    const last = segments[segments.length - 1];

    const done = last?.t === Type.S && last?.marker === Marker.EOI;

    return { done, item: segments };
  }
}

const parseSegments = (
  buffer: ArrayBuffer,
  items: Item[]
): [ArrayBuffer, Item[]] => {
  if (buffer.byteLength < 2) {
    return [buffer, items];
  }

  const marker = readSegmentMarker(buffer);
  if (marker === Marker.EOI) {
    return [buffer.slice(2), [...items, { t: Type.S, marker }]];
  }
  if (marker === Marker.SOI) {
    return parseSegments(buffer.slice(2), [...items, { t: Type.S, marker }]);
  }

  if (buffer.byteLength < 4) {
    return [buffer, items];
  }

  const size = readSegmentSize(buffer);
  if (buffer.byteLength < 2 + size) {
    return [buffer, items];
  }

  if (marker === Marker.SOS) {
    try {
      readSegmentMarker(buffer.slice(buffer.byteLength - 2));
    } catch (e) {
      return [buffer, items];
    }

    return [
      buffer.slice(buffer.byteLength),
      [
        ...items,
        {
          t: Type.S,
          marker,
          size,
          parameter: buffer.slice(4, 2 + size),
        },
        { t: Type.D, data: buffer.slice(2 + size, buffer.byteLength - 2) },
        { t: Type.S, marker: Marker.EOI },
      ],
    ];
  }

  if (isSOF(marker)) {
    const view = new DataView(buffer.slice(5, 9));
    const y: number = view.getUint16(0);
    const x: number = view.getUint16(2);
    const segment: SOFSegment = { t: Type.S, marker, size, x, y };

    return parseSegments(buffer.slice(2 + size), [...items, segment]);
  }

  if (isAPP1(marker)) {
    const exifParser = new ExifParser();
    const {
      item: { tiffHeader, zerothIFD, firstIFD, exifIFD },
    } = exifParser.parse(buffer);

    const segment: ExifSegment = {
      t: Type.S,
      marker: Marker.APP1,
      size,
      tiffHeader,
      zerothIFD,
      firstIFD,
      exifIFD,
    };

    return parseSegments(buffer.slice(2 + size), [...items, segment]);
  }

  return parseSegments(buffer.slice(2 + size), [
    ...items,
    {
      t: Type.S,
      marker,
      size,
      parameter: buffer.slice(4, 2 + size),
    },
  ]);
};

const readSegmentSize = (buffer: ArrayBuffer): number => {
  const view = new DataView(buffer, 2, 4);
  return view.getUint16(0);
};
