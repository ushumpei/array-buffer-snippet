export const consoleStream: () => WritableStream<unknown> = () =>
  new WritableStream({
    write(chunk) {
      console.log(chunk);
    },
  });
