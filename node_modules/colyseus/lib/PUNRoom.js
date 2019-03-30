"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("@colyseus/schema");
const Room_1 = require("./Room");
class Player extends schema_1.Schema {
}
__decorate([
    schema_1.type('string')
], Player.prototype, "id", void 0);
__decorate([
    schema_1.type('boolean')
], Player.prototype, "connected", void 0);
class State {
    constructor() {
        this.players = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type({ map: Player })
], State.prototype, "players", void 0);
/**
 * client.join("punroom", {
 *   create: true,
 *   maxClients: 10,
 *   allowReconnectionTime: 20
 * });
 */
class PUNRoom extends Room_1.Room {
    constructor() {
        super(...arguments);
        this.allowReconnectionTime = 0;
    }
    requestJoin(options, isNewRoom) {
        return (options.create)
            ? (options.create && isNewRoom)
            : this.clients.length > 0;
    }
    onInit(options) {
        this.setState(new State());
        if (options.maxClients) {
            this.maxClients = options.maxClients;
        }
        if (options.allowReconnectionTime) {
            this.allowReconnectionTime = Math.min(options.allowReconnectionTime, 40);
        }
        if (options.metadata) {
            this.setMetadata(options.metadata);
        }
    }
    onJoin(client, options) {
        const player = new Player();
        // first player joining is assigned as master
        player.isMaster = (this.clients.length === 1);
        if (this.allowReconnectionTime > 0) {
            player.connected = true;
        }
        this.state.players[client.sessionId] = player;
    }
    onMessage(client, message) {
        message.sessionId = client.sessionId;
        this.broadcast(message, { except: client });
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            // master is leaving, let's assign a new master.
            if (this.state.players[client.sessionId].isMaster) {
                const availableSessionIds = Object.keys(this.state.players).filter((sessionId) => sessionId !== client.sessionId);
                const newMasterSessionId = availableSessionIds[Math.floor(Math.random() * availableSessionIds.length)];
                this.state.players[newMasterSessionId].isMaster = true;
            }
            if (this.allowReconnectionTime > 0) {
                this.state.players[client.sessionId].connected = false;
                try {
                    if (consented) {
                        throw new Error('consented leave');
                    }
                    yield this.allowReconnection(client, this.allowReconnectionTime);
                    this.state.players[client.sessionId].connected = true;
                }
                catch (e) {
                    delete this.state.players[client.sessionId];
                }
            }
        });
    }
}
exports.PUNRoom = PUNRoom;
