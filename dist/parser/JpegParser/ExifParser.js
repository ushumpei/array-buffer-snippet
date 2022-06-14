import { IFDParser } from "./IFDParser.js";
var ExifParser = (function () {
    function ExifParser() {
    }
    Object.defineProperty(ExifParser.prototype, "parse", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (buffer) {
            var size = readSegmentSize(buffer);
            if (buffer.byteLength < 2 + size) {
                throw new Error("Illegal State.");
            }
            if (!isExif(buffer)) {
                throw new Error("Illegal State.");
            }
            var tiffHeader = readTiffHeader(buffer);
            var zerothIFD = new IFDParser(tiffHeader).parse(buffer.slice(10));
            var hasFirstIFD = zerothIFD.item.offset > 0;
            var firstIFD;
            if (hasFirstIFD) {
                firstIFD = new IFDParser({
                    offset: zerothIFD.item.offset,
                    isLittleEndian: tiffHeader.isLittleEndian,
                }).parse(buffer.slice(10)).item.fields;
            }
            var exifIFD;
            zerothIFD.item.fields
                .filter(function (field) { return field.tag === 34665; })
                .forEach(function (field) {
                exifIFD = new IFDParser({
                    offset: field.value,
                    isLittleEndian: tiffHeader.isLittleEndian,
                }).parse(buffer.slice(10)).item.fields;
            });
            return {
                item: {
                    tiffHeader: tiffHeader,
                    zerothIFD: zerothIFD.item.fields,
                    firstIFD: firstIFD,
                    exifIFD: exifIFD,
                },
            };
        }
    });
    return ExifParser;
}());
export { ExifParser };
var readSegmentSize = function (buffer) {
    var view = new DataView(buffer, 2, 4);
    return view.getUint16(0);
};
var isExif = function (buffer) {
    var view = new DataView(buffer.slice(4, 10));
    var exifArray = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
    return exifArray.every(function (v, i) { return v === view.getUint8(i); });
};
var readTiffHeader = function (buffer) {
    var view = new DataView(buffer.slice(10, 12));
    var offset = new DataView(buffer.slice(14, 18));
    var isBigEndian = view.getUint8(0) === 0x4d && view.getUint8(1) === 0x4d;
    if (isBigEndian) {
        return { offset: offset.getUint32(0, false), isLittleEndian: false };
    }
    var isLittleEndian = view.getUint8(0) === 0x49 && view.getUint8(1) === 0x49;
    if (isLittleEndian) {
        return { offset: offset.getUint32(0, true), isLittleEndian: true };
    }
    throw new Error("Illegal State.");
};
//# sourceMappingURL=ExifParser.js.map