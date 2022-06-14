var _a;
var TypeSize = (_a = {},
    _a[1] = 1,
    _a[2] = 1,
    _a[3] = 2,
    _a[4] = 4,
    _a[5] = 8,
    _a[6] = 1,
    _a[7] = 1,
    _a[8] = 2,
    _a[9] = 4,
    _a[10] = 8,
    _a[11] = 4,
    _a[12] = 8,
    _a);
var IFDParser = (function () {
    function IFDParser(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
    }
    Object.defineProperty(IFDParser.prototype, "parse", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (buffer) {
            var _this = this;
            var countView = new DataView(buffer.slice(this.config.offset, this.config.offset + 2));
            var count = countView.getUint16(0, this.config.isLittleEndian);
            var offsetView = new DataView(buffer.slice(this.config.offset + 2 + count * 12, this.config.offset + 2 + count * 12 + 4));
            var offset = offsetView.getUint32(0, this.config.isLittleEndian);
            return {
                item: {
                    count: count,
                    fields: Array.from({ length: count }, function (_, i) { return i; }).map(function (i) {
                        var result = readField(buffer.slice(_this.config.offset + 2 + i * 12), _this.config.isLittleEndian);
                        if (!result.complete) {
                            return {
                                tag: result.tag,
                                type: result.type,
                                count: result.count,
                                value: readValue(buffer.slice(result.offset), result.type, result.count, _this.config.isLittleEndian),
                            };
                        }
                        return {
                            tag: result.tag,
                            type: result.type,
                            count: result.count,
                            value: result.value,
                        };
                    }),
                    offset: offset,
                },
            };
        }
    });
    return IFDParser;
}());
export { IFDParser };
var readField = function (buffer, isLittleEndian) {
    var view = new DataView(buffer);
    var tag = view.getUint16(0, isLittleEndian);
    var typeName = view.getUint16(2, isLittleEndian);
    var size = TypeSize[typeName];
    if (!size)
        throw new Error("Illegal State.");
    var type = { name: typeName, size: size };
    var count = view.getUint32(4, isLittleEndian);
    var offset = view.getUint32(8, isLittleEndian);
    if (size * count <= 4) {
        return {
            complete: true,
            tag: tag,
            type: type,
            count: count,
            value: readValue(buffer.slice(8, 12), type, count, isLittleEndian),
        };
    }
    return {
        complete: false,
        tag: tag,
        type: type,
        count: count,
        offset: offset,
    };
};
var readValue = function (buffer, type, count, isLittleEndian) {
    var values = Array.from({ length: count }).map(function (_, i) {
        return getByType(buffer.slice(i * type.size, (i + 1) * type.size), type, isLittleEndian);
    });
    if (values.length === 1 && values[0])
        return values[0];
    if (type.name === 2)
        return values.join("");
    return values;
};
var getByType = function (buffer, type, isLittleEndian) {
    var view = new DataView(buffer);
    switch (type.name) {
        case 1:
            return view.getUint8(0);
        case 2:
            return String.fromCharCode(view.getUint8(0));
        case 3:
            return view.getUint16(0, isLittleEndian);
        case 4:
            return view.getUint32(0, isLittleEndian);
        case 5:
            return "".concat(view.getUint32(0, isLittleEndian), "/").concat(view.getUint32(4, isLittleEndian));
        case 6:
            return view.getInt8(0);
        case 7:
            return view.getUint8(0);
        case 8:
            return view.getInt16(0, isLittleEndian);
        case 9:
            return view.getInt32(0, isLittleEndian);
        case 10:
            return "".concat(view.getInt32(0, isLittleEndian), "/").concat(view.getInt32(0 + 4, isLittleEndian));
        case 11:
            return view.getFloat32(0, isLittleEndian);
        case 12:
            return view.getFloat64(0, isLittleEndian);
        default:
            throw new Error("Illegal state.");
    }
};
//# sourceMappingURL=IFDParser.js.map