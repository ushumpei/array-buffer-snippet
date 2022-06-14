var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { ExifParser, } from "./ExifParser.js";
import { mergeBuffers } from "../Parser.js";
import { isAPP1, isSOF, readSegmentMarker, } from "./Marker.js";
var JpegParser = (function () {
    function JpegParser() {
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.buffer = new ArrayBuffer(0);
    }
    Object.defineProperty(JpegParser.prototype, "parse", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (buffer) {
            this.buffer = mergeBuffers(this.buffer, buffer);
            var _a = parseSegments(this.buffer, []), remainingBuffer = _a[0], segments = _a[1];
            this.buffer = remainingBuffer;
            var last = segments[segments.length - 1];
            var done = (last === null || last === void 0 ? void 0 : last.t) === "Segment" && (last === null || last === void 0 ? void 0 : last.marker) === "ffd9";
            return { done: done, item: segments };
        }
    });
    return JpegParser;
}());
export { JpegParser };
var parseSegments = function (buffer, items) {
    if (buffer.byteLength < 2) {
        return [buffer, items];
    }
    var marker = readSegmentMarker(buffer);
    if (marker === "ffd9") {
        return [buffer.slice(2), __spreadArray(__spreadArray([], items, true), [{ t: "Segment", marker: marker }], false)];
    }
    if (marker === "ffd8") {
        return parseSegments(buffer.slice(2), __spreadArray(__spreadArray([], items, true), [{ t: "Segment", marker: marker }], false));
    }
    if (buffer.byteLength < 4) {
        return [buffer, items];
    }
    var size = readSegmentSize(buffer);
    if (buffer.byteLength < 2 + size) {
        return [buffer, items];
    }
    if (marker === "ffda") {
        try {
            readSegmentMarker(buffer.slice(buffer.byteLength - 2));
        }
        catch (e) {
            return [buffer, items];
        }
        return [
            buffer.slice(buffer.byteLength),
            __spreadArray(__spreadArray([], items, true), [
                {
                    t: "Segment",
                    marker: marker,
                    size: size,
                    parameter: buffer.slice(4, 2 + size),
                },
                { t: "Data", data: buffer.slice(2 + size, buffer.byteLength - 2) },
                { t: "Segment", marker: "ffd9" },
            ], false),
        ];
    }
    if (isSOF(marker)) {
        var view = new DataView(buffer.slice(5, 9));
        var y = view.getUint16(0);
        var x = view.getUint16(2);
        var segment = { t: "Segment", marker: marker, size: size, x: x, y: y };
        return parseSegments(buffer.slice(2 + size), __spreadArray(__spreadArray([], items, true), [segment], false));
    }
    if (isAPP1(marker)) {
        var exifParser = new ExifParser();
        var _a = exifParser.parse(buffer).item, tiffHeader = _a.tiffHeader, zerothIFD = _a.zerothIFD, firstIFD = _a.firstIFD, exifIFD = _a.exifIFD;
        var segment = {
            t: "Segment",
            marker: "ffe1",
            size: size,
            tiffHeader: tiffHeader,
            zerothIFD: zerothIFD,
            firstIFD: firstIFD,
            exifIFD: exifIFD,
        };
        return parseSegments(buffer.slice(2 + size), __spreadArray(__spreadArray([], items, true), [segment], false));
    }
    return parseSegments(buffer.slice(2 + size), __spreadArray(__spreadArray([], items, true), [
        {
            t: "Segment",
            marker: marker,
            size: size,
            parameter: buffer.slice(4, 2 + size),
        },
    ], false));
};
var readSegmentSize = function (buffer) {
    var view = new DataView(buffer, 2, 4);
    return view.getUint16(0);
};
//# sourceMappingURL=index.js.map