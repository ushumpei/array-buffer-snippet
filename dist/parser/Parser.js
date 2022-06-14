export var mergeBuffers = function (b1, b2) {
    var a = new Uint8Array(b1.byteLength + b2.byteLength);
    a.set(new Uint8Array(b1), 0);
    a.set(new Uint8Array(b2), b1.byteLength);
    return a.buffer;
};
export var bufferToAscii = function (buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(function (b) { return String.fromCharCode(b); })
        .join("");
};
//# sourceMappingURL=Parser.js.map