import { Parser } from "../parser/Parser.js";

export const transform = <T>(
  parser: Parser<T[]>
): TransformStream<ArrayBuffer, T> => {
  return new TransformStream({
    transform(
      chunk: ArrayBuffer,
      controller: TransformStreamDefaultController<T>
    ) {
      const result = parser.parse(chunk);
      result.item.forEach((i: T) => controller.enqueue(i));

      if (result.done) controller.terminate();
    },
  });
};
