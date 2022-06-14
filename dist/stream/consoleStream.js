export var consoleStream = function () {
    return new WritableStream({
        write: function (chunk) {
            console.log(chunk);
        },
    });
};
//# sourceMappingURL=consoleStream.js.map