"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
exports.debugMatchMaking = debug('colyseus:matchmaking');
exports.debugPatch = debug('colyseus:patch');
exports.debugPatchData = debug('colyseus:patch:data');
exports.debugError = debug('colyseus:errors');
exports.debugAndPrintError = (...args) => {
    console.error(...args);
    exports.debugError.apply(exports.debugError, args);
};
