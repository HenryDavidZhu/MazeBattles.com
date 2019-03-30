"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(serializer) {
    return (constructor) => {
        constructor.prototype._getSerializer = () => new serializer();
    };
}
exports.serialize = serialize;
