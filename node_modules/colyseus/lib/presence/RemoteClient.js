"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const events_1 = require("events");
class RemoteClient extends events_1.EventEmitter {
    constructor(client, roomId, presence) {
        super();
        this.readyState = WebSocket.OPEN;
        this.id = client.id;
        this.sessionId = client.sessionId;
        this.roomId = roomId;
        this.presence = presence;
        this.once('close', (code) => this.close(code));
    }
    send(buffer) {
        this.presence.publish(`${this.roomId}:${this.sessionId}`, ['send', Array.from(buffer)]);
    }
    close(code) {
        this.presence.publish(`${this.roomId}:${this.sessionId}`, ['close', code]);
    }
}
exports.RemoteClient = RemoteClient;
