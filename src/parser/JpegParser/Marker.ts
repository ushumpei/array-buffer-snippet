export const enum Marker {
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
  SOF15 = "ffcf",
}

export type SOFMarker = Extract<
  Marker,
  | Marker.SOF0
  | Marker.SOF1
  | Marker.SOF2
  | Marker.SOF3
  | Marker.SOF5
  | Marker.SOF6
  | Marker.SOF7
  | Marker.SOF9
  | Marker.SOF10
  | Marker.SOF11
  | Marker.SOF13
  | Marker.SOF14
  | Marker.SOF15
>;

export const readSegmentMarker = (buffer: ArrayBuffer): Marker | string => {
  const view = new DataView(buffer);
  const marker = view.getUint8(0).toString(16) + view.getUint8(1).toString(16);

  switch (marker) {
    case Marker.SOI:
    case Marker.EOI:
    case Marker.SOS:
    case Marker.APP1:
    case Marker.SOF0:
    case Marker.SOF1:
    case Marker.SOF2:
    case Marker.SOF3:
    case Marker.SOF5:
    case Marker.SOF6:
    case Marker.SOF7:
    case Marker.SOF9:
    case Marker.SOF10:
    case Marker.SOF11:
    case Marker.SOF13:
    case Marker.SOF14:
    case Marker.SOF15:
      return marker;
    default:
      if (/ff.{2}/.test(marker)) return marker;

      throw new Error("Illegal state");
  }
};

export const isSOF = (marker: string): marker is SOFMarker =>
  /ffc[0-3|5-7|9|a|b|d-f]/.test(marker);

export const isAPP1 = (marker: string): marker is Marker.APP1 =>
  /ffe1/.test(marker);
