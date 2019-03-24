"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseURL = require("url-parse");
const WebSocket = require("ws");
const Debug_1 = require("./Debug");
const MatchMaker_1 = require("./MatchMaker");
const Errors_1 = require("./Errors");
const index_1 = require("./index");
const Protocol_1 = require("./Protocol");
const Utils_1 = require("./Utils");
function noop() { }
function heartbeat() { this.pingCount = 0; }
class Server {
    constructor(options = {}) {
        this.onShutdownCallback = () => Promise.resolve();
        this.verifyClient = (info, next) => __awaiter(this, void 0, void 0, function* () {
            const req = info.req;
            const url = parseURL(req.url);
            req.roomId = url.pathname.substr(1);
            const query = Utils_1.parseQueryString(url.query);
            req.colyseusid = query.colyseusid;
            delete query.colyseusid;
            req.options = query;
            if (req.roomId) {
                try {
                    // TODO: refactor me. this piece of code is repeated on MatchMaker class.
                    const hasReservedSeat = query.sessionId && (yield this.matchMaker.remoteRoomCall(req.roomId, 'hasReservedSeat', [query.sessionId]));
                    if (!hasReservedSeat) {
                        const isLocked = yield this.matchMaker.remoteRoomCall(req.roomId, 'locked');
                        if (isLocked) {
                            return next(false, Protocol_1.Protocol.WS_TOO_MANY_CLIENTS, 'maxClients reached.');
                        }
                    }
                    // verify client from room scope.
                    const authResult = yield this.matchMaker.remoteRoomCall(req.roomId, 'onAuth', [req.options], MatchMaker_1.REMOTE_ROOM_LARGE_TIMEOUT);
                    if (authResult) {
                        req.auth = authResult;
                        next(true);
                    }
                    else {
                        throw new Error('onAuth failed.');
                    }
                }
                catch (e) {
                    if (e) { // user might have called `reject()` during onAuth without arguments.
                        Debug_1.debugAndPrintError(e.message + '\n' + e.stack);
                    }
                    next(false);
                }
            }
            else {
                next(true);
            }
        });
        this.onConnection = (client, req) => {
            // compatibility with ws / uws
            const upgradeReq = req || client.upgradeReq;
            // set client id
            client.id = upgradeReq.colyseusid || index_1.generateId();
            client.pingCount = 0;
            // ensure client has its "colyseusid"
            if (!upgradeReq.colyseusid) {
                Protocol_1.send(client, [Protocol_1.Protocol.USER_ID, client.id]);
            }
            // set client options
            client.options = upgradeReq.options;
            client.auth = upgradeReq.auth;
            // prevent server crashes if a single client had unexpected error
            client.on('error', (err) => Debug_1.debugAndPrintError(err.message + '\n' + err.stack));
            client.on('pong', heartbeat);
            const roomId = upgradeReq.roomId;
            if (roomId) {
                this.matchMaker.connectToRoom(client, upgradeReq.roomId).
                    catch((e) => {
                    Debug_1.debugAndPrintError(e.stack || e);
                    Protocol_1.send(client, [Protocol_1.Protocol.JOIN_ERROR, roomId, e && e.message]);
                });
            }
            else {
                client.on('message', this.onMessageMatchMaking.bind(this, client));
            }
        };
        const { gracefullyShutdown = true } = options;
        this.presence = options.presence;
        this.matchMaker = new MatchMaker_1.MatchMaker(this.presence);
        this.pingTimeout = (options.pingTimeout !== undefined)
            ? options.pingTimeout
            : 1500;
        // "presence" option is not used from now on
        delete options.presence;
        if (gracefullyShutdown) {
            Utils_1.registerGracefulShutdown((signal) => this.gracefullyShutdown());
        }
        if (options.server) {
            this.attach(options);
        }
    }
    attach(options) {
        const engine = options.engine || WebSocket.Server;
        delete options.engine;
        if (options.server || options.port) {
            const customVerifyClient = options.verifyClient;
            options.verifyClient = (info, next) => {
                if (!customVerifyClient) {
                    return this.verifyClient(info, next);
                }
                customVerifyClient(info, (verified, code, message) => {
                    if (!verified) {
                        return next(verified, code, message);
                    }
                    this.verifyClient(info, next);
                });
            };
            this.server = new engine(options);
            this.httpServer = options.server;
        }
        else {
            this.server = options.ws;
        }
        this.server.on('connection', this.onConnection);
        if (this.pingTimeout > 0) {
            this.autoTerminateUnresponsiveClients(this.pingTimeout);
        }
    }
    listen(port, hostname, backlog, listeningListener) {
        this.httpServer.listen(port, hostname, backlog, listeningListener);
    }
    register(name, handler, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.matchMaker.registerHandler(name, handler, options);
        });
    }
    gracefullyShutdown(exit = true) {
        return this.matchMaker.gracefullyShutdown().
            then(() => {
            clearInterval(this.pingInterval);
            return this.onShutdownCallback();
        }).
            catch((err) => Debug_1.debugAndPrintError(`error during shutdown: ${err}`)).
            then(() => {
            if (exit) {
                process.exit();
            }
        });
    }
    onShutdown(callback) {
        this.onShutdownCallback = callback;
    }
    autoTerminateUnresponsiveClients(pingTimeout) {
        // interval to detect broken connections
        this.pingInterval = setInterval(() => {
            this.server.clients.forEach((client) => {
                //
                // if client hasn't responded after the interval, terminate its connection.
                //
                if (client.pingCount >= 2) {
                    return client.terminate();
                }
                client.pingCount++;
                client.ping(noop);
            });
        }, pingTimeout);
    }
    onMessageMatchMaking(client, message) {
        message = Protocol_1.decode(message);
        if (!message) {
            Debug_1.debugAndPrintError(`couldn't decode message: ${message}`);
            return;
        }
        if (message[0] === Protocol_1.Protocol.JOIN_ROOM) {
            const roomName = message[1];
            const joinOptions = message[2];
            joinOptions.clientId = client.id;
            if (!this.matchMaker.hasHandler(roomName) && !index_1.isValidId(roomName)) {
                Protocol_1.send(client, [Protocol_1.Protocol.JOIN_ERROR, roomName, `Error: no available handler for "${roomName}"`]);
            }
            else {
                //
                // As a room might stop responding during the matchmaking process, due to it being disposed.
                // The last step of the matchmaking will make sure a seat will be reserved for this client
                // If `onJoinRoomRequest` can't make it until the very last step, a retry is necessary.
                //
                Utils_1.retry(() => {
                    return this.matchMaker.onJoinRoomRequest(client, roomName, joinOptions);
                }, 3, 0, [Errors_1.MatchMakeError]).
                    then((roomId) => {
                    Protocol_1.send(client, [Protocol_1.Protocol.JOIN_ROOM, roomId, joinOptions.requestId]);
                }).catch((e) => {
                    Debug_1.debugError(`MatchMakeError: ${message}\n${e.stack}`);
                    Protocol_1.send(client, [Protocol_1.Protocol.JOIN_ERROR, roomName, e && e.message]);
                });
            }
        }
        else if (message[0] === Protocol_1.Protocol.ROOM_LIST) {
            const requestId = message[1];
            const roomName = message[2];
            this.matchMaker.getAvailableRooms(roomName).
                then((rooms) => Protocol_1.send(client, [Protocol_1.Protocol.ROOM_LIST, requestId, rooms])).
                catch((e) => Debug_1.debugAndPrintError(e.stack || e));
        }
        else {
            Debug_1.debugAndPrintError(`MatchMaking couldn\'t process message: ${message}`);
        }
    }
}
exports.Server = Server;
