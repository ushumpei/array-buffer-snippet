export var readSegmentMarker = function (buffer) {
    var view = new DataView(buffer);
    var marker = view.getUint8(0).toString(16) + view.getUint8(1).toString(16);
    switch (marker) {
        case "ffd8":
        case "ffd9":
        case "ffda":
        case "ffe1":
        case "ffc0":
        case "ffc1":
        case "ffc2":
        case "ffc3":
        case "ffc5":
        case "ffc6":
        case "ffc7":
        case "ffc9":
        case "ffca":
        case "ffcb":
        case "ffcd":
        case "ffce":
        case "ffcf":
            return marker;
        default:
            if (/ff.{2}/.test(marker))
                return marker;
            throw new Error("Illegal state");
    }
};
export var isSOF = function (marker) {
    return /ffc[0-3|5-7|9|a|b|d-f]/.test(marker);
};
export var isAPP1 = function (marker) {
    return /ffe1/.test(marker);
};
//# sourceMappingURL=Marker.js.map