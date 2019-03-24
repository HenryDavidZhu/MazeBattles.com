"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack = require("notepack.io");
const WebSocket = require("ws");
const Debug_1 = require("./Debug");
exports.WS_CLOSE_CONSENTED = 4000;
// Use codes between 0~127 for lesser throughput (1 byte)
var Protocol;
(function (Protocol) {
    // User-related (1~9)
    Protocol[Protocol["USER_ID"] = 1] = "USER_ID";
    // Room-related (10~19)
    Protocol[Protocol["JOIN_ROOM"] = 10] = "JOIN_ROOM";
    Protocol[Protocol["JOIN_ERROR"] = 11] = "JOIN_ERROR";
    Protocol[Protocol["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
    Protocol[Protocol["ROOM_DATA"] = 13] = "ROOM_DATA";
    Protocol[Protocol["ROOM_STATE"] = 14] = "ROOM_STATE";
    Protocol[Protocol["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
    // Match-making related (20~29)
    Protocol[Protocol["ROOM_LIST"] = 20] = "ROOM_LIST";
    // Generic messages (50~60)
    Protocol[Protocol["BAD_REQUEST"] = 50] = "BAD_REQUEST";
    // WebSocket error codes
    Protocol[Protocol["WS_SERVER_DISCONNECT"] = 4201] = "WS_SERVER_DISCONNECT";
    Protocol[Protocol["WS_TOO_MANY_CLIENTS"] = 4202] = "WS_TOO_MANY_CLIENTS";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
// Inter-process communication protocol
var IpcProtocol;
(function (IpcProtocol) {
    IpcProtocol[IpcProtocol["SUCCESS"] = 0] = "SUCCESS";
    IpcProtocol[IpcProtocol["ERROR"] = 1] = "ERROR";
    IpcProtocol[IpcProtocol["TIMEOUT"] = 2] = "TIMEOUT";
})(IpcProtocol = exports.IpcProtocol || (exports.IpcProtocol = {}));
function decode(message) {
    try {
        message = msgpack.decode(Buffer.from(message));
    }
    catch (e) {
        Debug_1.debugAndPrintError(`message couldn't be decoded: ${message}\n${e.stack}`);
        return;
    }
    return message;
}
exports.decode = decode;
function send(client, message, encode = true) {
    if (client.readyState === WebSocket.OPEN) {
        client.send((encode && msgpack.encode(message)) || message, { binary: true });
    }
}
exports.send = send;
