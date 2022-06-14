export declare const enum Marker {
    SOI = "ffd8",
    EOI = "ffd9",
    SOS = "ffda",
    APP1 = "ffe1",
    SOF0 = "ffc0",
    SOF1 = "ffc1",
    SOF2 = "ffc2",
    SOF3 = "ffc3",
    SOF5 = "ffc5",
    SOF6 = "ffc6",
    SOF7 = "ffc7",
    SOF9 = "ffc9",
    SOF10 = "ffca",
    SOF11 = "ffcb",
    SOF13 = "ffcd",
    SOF14 = "ffce",
    SOF15 = "ffcf"
}
export declare type SOFMarker = Extract<Marker, Marker.SOF0 | Marker.SOF1 | Marker.SOF2 | Marker.SOF3 | Marker.SOF5 | Marker.SOF6 | Marker.SOF7 | Marker.SOF9 | Marker.SOF10 | Marker.SOF11 | Marker.SOF13 | Marker.SOF14 | Marker.SOF15>;
export declare const readSegmentMarker: (buffer: ArrayBuffer) => Marker | string;
export declare const isSOF: (marker: string) => marker is SOFMarker;
export declare const isAPP1: (marker: string) => marker is Marker.APP1;
