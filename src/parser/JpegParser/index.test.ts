import { readFileSync } from "fs";
import { join, dirname } from "path";
import { ExifSegment, JpegParser, Type } from "./index";
import { Marker } from "./Marker";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("test1", async () => {
  const buffer = readFileSync(join(__dirname, "../../../tests/test.jpeg"));
  const parser = new JpegParser();
  const result = parser.parse(buffer.buffer);
  const segments = result.item;

  const exif: ExifSegment | undefined = segments.find(
    (s): s is ExifSegment => s.t === Type.S && s.marker === Marker.APP1
  );
  expect(exif?.tiffHeader.isLittleEndian).toBeFalsy();

  const orientation = exif?.zerothIFD.find((ifd) => ifd.tag === 274);
  expect(orientation?.value).toBe(1);
});

test("test2", async () => {
  const buffer = readFileSync(join(__dirname, "../../../tests/test2.jpeg"));
  const parser = new JpegParser();
  const result = parser.parse(buffer.buffer);
  const segments = result.item;

  const exif: ExifSegment | undefined = segments.find(
    (s): s is ExifSegment => s.t === Type.S && s.marker === Marker.APP1
  );
  expect(exif?.tiffHeader.isLittleEndian).toBeFalsy();

  const orientation = exif?.zerothIFD.find((ifd) => ifd.tag === 274);
  expect(orientation?.value).toBe(6);
});

test("test3", async () => {
  const buffer = readFileSync(join(__dirname, "../../../tests/test3.jpeg"));
  const parser = new JpegParser();
  const result = parser.parse(buffer.buffer);
  const segments = result.item;

  const exif: ExifSegment | undefined = segments.find(
    (s): s is ExifSegment => s.t === Type.S && s.marker === Marker.APP1
  );
  expect(exif?.tiffHeader.isLittleEndian).toBeTruthy();

  const orientation = exif?.zerothIFD.find((ifd) => ifd.tag === 274);
  expect(orientation?.value).toBe(1);
});
