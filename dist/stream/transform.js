export var transform = function (parser) {
    return new TransformStream({
        transform: function (chunk, controller) {
            var result = parser.parse(chunk);
            result.item.forEach(function (i) { return controller.enqueue(i); });
            if (result.done)
                controller.terminate();
        },
    });
};
//# sourceMappingURL=transform.js.map