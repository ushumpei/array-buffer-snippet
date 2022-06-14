import { SyncParser, SyncParseResult } from "../Parser.js";

const enum TypeName {
  "BYTE" = 1,
  "ASCII" = 2,
  "SHORT" = 3,
  "LONG" = 4,
  "RATIONAL" = 5,
  "SBYTE" = 6,
  "UNDEFINED" = 7,
  "SSHORT" = 8,
  "SLONG" = 9,
  "SRATIONAL" = 10,
  "FLOAT" = 11,
  "DFLOAT" = 12,
}
type Type = {
  name: TypeName;
  size: number;
};
const TypeSize: { [key in TypeName]: number } = {
  [TypeName.BYTE]: 1,
  [TypeName.ASCII]: 1,
  [TypeName.SHORT]: 2,
  [TypeName.LONG]: 4,
  [TypeName.RATIONAL]: 8,
  [TypeName.SBYTE]: 1,
  [TypeName.UNDEFINED]: 1,
  [TypeName.SSHORT]: 2,
  [TypeName.SLONG]: 4,
  [TypeName.SRATIONAL]: 8,
  [TypeName.FLOAT]: 4,
  [TypeName.DFLOAT]: 8,
};

export type ExifIFDField = {
  tag: number;
  type: Type;
  count: number;
  value: number;
};
export type Field = {
  tag: number;
  type: Type;
  count: number;
  value: string | number | (string | number)[] | undefined;
};
export type IFD = {
  count: number;
  fields: (Field | ExifIFDField)[];
  offset: number;
};

type Complete = {
  complete: true;
  tag: number;
  type: Type;
  count: number;
  value: string | number | (string | number)[] | undefined;
};
type Incomplete = {
  complete: false;
  tag: number;
  type: Type;
  count: number;
  offset: number;
};

export class IFDParser implements SyncParser<IFD> {
  config: { offset: number; isLittleEndian: boolean };
  constructor(config: { offset: number; isLittleEndian: boolean }) {
    this.config = config;
  }

  parse(buffer: ArrayBuffer): SyncParseResult<IFD> {
    const countView = new DataView(
      buffer.slice(this.config.offset, this.config.offset + 2)
    );
    const count = countView.getUint16(0, this.config.isLittleEndian);

    const offsetView = new DataView(
      buffer.slice(
        this.config.offset + 2 + count * 12,
        this.config.offset + 2 + count * 12 + 4
      )
    );
    const offset = offsetView.getUint32(0, this.config.isLittleEndian);

    return {
      item: {
        count,
        fields: Array.from({ length: count }, (_, i) => i).map((i) => {
          const result = readField(
            buffer.slice(this.config.offset + 2 + i * 12),
            this.config.isLittleEndian
          );
          if (!result.complete) {
            return {
              tag: result.tag,
              type: result.type,
              count: result.count,
              value: readValue(
                buffer.slice(result.offset),
                result.type,
                result.count,
                this.config.isLittleEndian
              ),
            };
          }
          return {
            tag: result.tag,
            type: result.type,
            count: result.count,
            value: result.value,
          };
        }),
        offset,
      },
    };
  }
}

const readField = (
  buffer: ArrayBuffer,
  isLittleEndian: boolean
): Complete | Incomplete => {
  const view = new DataView(buffer);

  const tag = view.getUint16(0, isLittleEndian);

  const typeName: TypeName = view.getUint16(2, isLittleEndian);
  const size = TypeSize[typeName];
  if (!size) throw new Error("Illegal State.");
  const type = { name: typeName, size };

  const count = view.getUint32(4, isLittleEndian);

  const offset = view.getUint32(8, isLittleEndian);

  if (size * count <= 4) {
    return {
      complete: true,
      tag,
      type,
      count,
      value: readValue(buffer.slice(8, 12), type, count, isLittleEndian),
    };
  }

  return {
    complete: false,
    tag,
    type,
    count,
    offset,
  };
};

const readValue = (
  buffer: ArrayBuffer,
  type: Type,
  count: number,
  isLittleEndian: boolean
): string | number | (string | number)[] => {
  const values = Array.from({ length: count }).map((_, i) =>
    getByType(
      buffer.slice(i * type.size, (i + 1) * type.size),
      type,
      isLittleEndian
    )
  );
  if (values.length === 1 && values[0]) return values[0];
  if (type.name === TypeName.ASCII) return values.join("");

  return values;
};

const getByType = (
  buffer: ArrayBuffer,
  type: Type,
  isLittleEndian: boolean
): string | number => {
  const view = new DataView(buffer);

  switch (type.name) {
    case TypeName.BYTE:
      return view.getUint8(0);
    case TypeName.ASCII:
      return String.fromCharCode(view.getUint8(0));
    case TypeName.SHORT:
      return view.getUint16(0, isLittleEndian);
    case TypeName.LONG:
      return view.getUint32(0, isLittleEndian);
    case TypeName.RATIONAL:
      return `${view.getUint32(0, isLittleEndian)}/${view.getUint32(
        4,
        isLittleEndian
      )}`;
    case TypeName.SBYTE:
      return view.getInt8(0);
    case TypeName.UNDEFINED:
      return view.getUint8(0);
    case TypeName.SSHORT:
      return view.getInt16(0, isLittleEndian);
    case TypeName.SLONG:
      return view.getInt32(0, isLittleEndian);
    case TypeName.SRATIONAL:
      return `${view.getInt32(0, isLittleEndian)}/${view.getInt32(
        0 + 4,
        isLittleEndian
      )}`;
    case TypeName.FLOAT:
      return view.getFloat32(0, isLittleEndian);
    case TypeName.DFLOAT:
      return view.getFloat64(0, isLittleEndian);
    default:
      throw new Error("Illegal state.");
  }
};
