import { Parser } from "../parser/Parser.js";
export declare const transform: <T>(parser: Parser<T[]>) => TransformStream<ArrayBuffer, T>;
