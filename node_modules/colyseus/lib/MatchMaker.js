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
const Utils_1 = require("./Utils");
const index_1 = require("./index");
const Protocol_1 = require("./Protocol");
const RegisteredHandler_1 = require("./matchmaker/RegisteredHandler");
const LocalPresence_1 = require("./presence/LocalPresence");
const Debug_1 = require("./Debug");
const Errors_1 = require("./Errors");
// remote room call timeouts
exports.REMOTE_ROOM_SHORT_TIMEOUT = Number(process.env.COLYSEUS_PRESENCE_SHORT_TIMEOUT || 4000);
exports.REMOTE_ROOM_LARGE_TIMEOUT = Number(process.env.COLYSEUS_PRESENCE_LARGE_TIMEOUT || 8000);
class MatchMaker {
    constructor(presence) {
        this.handlers = {};
        this.localRooms = {};
        this.isGracefullyShuttingDown = false;
        this.presence = presence || new LocalPresence_1.LocalPresence();
    }
    connectToRoom(client, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = this.localRooms[roomId];
            const clientOptions = client.options;
            // assign sessionId to socket connection.
            client.sessionId = yield this.presence.get(`${roomId}:${client.id}`);
            // clean temporary data
            delete clientOptions.auth;
            delete clientOptions.requestId;
            delete client.options;
            if (room) {
                room._onJoin(client, clientOptions, client.auth);
            }
            else {
                const remoteSessionSub = `${roomId}:${client.sessionId}`;
                this.presence.subscribe(remoteSessionSub, (message) => {
                    const [method, data] = message;
                    if (method === 'send') {
                        const buff = Buffer.allocUnsafe(data.length);
                        for (let i = 0, l = data.length; i < l; i++) {
                            buff.writeUInt8(data[i], i);
                        }
                        client.send(buff, { binary: true });
                    }
                    else if (method === 'close') {
                        client.close(data || undefined);
                    }
                });
                yield this.remoteRoomCall(roomId, '_onJoin', [{
                        id: client.id,
                        remote: true,
                        sessionId: client.sessionId,
                    }, clientOptions, client.auth]);
                // forward 'message' events to room's process
                client.on('message', (data) => {
                    // compatibility with uws
                    if (data instanceof ArrayBuffer) {
                        data = new Buffer(data);
                    }
                    this.remoteRoomCall(roomId, '_emitOnClient', [client.sessionId, Array.from(data)]);
                });
                // forward 'close' events to room's process
                client.once('close', (code) => {
                    this.presence.unsubscribe(remoteSessionSub);
                    this.remoteRoomCall(roomId, '_emitOnClient', [client.sessionId, 'close', code]);
                });
            }
        });
    }
    /**
     * Create or joins the client into a particular room
     *
     * The client doesn't join instantly because this method is called from the
     * match-making process. The client will request a new WebSocket connection
     * to effectively join into the room created/joined by this method.
     */
    onJoinRoomRequest(client, roomToJoin, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasHandler = this.hasHandler(roomToJoin);
            let roomId;
            // `rejoin` requests come with a pre-set `sessionId`
            const isReconnect = (clientOptions.sessionId !== undefined);
            const sessionId = clientOptions.sessionId || index_1.generateId();
            const isJoinById = (!hasHandler && index_1.isValidId(roomToJoin));
            let shouldCreateRoom = hasHandler && !isReconnect;
            if (isReconnect) {
                roomToJoin = yield this.presence.get(sessionId);
                if (!roomToJoin) {
                    throw new Errors_1.MatchMakeError(`rejoin has been expired for ${sessionId}`);
                }
            }
            if (isJoinById || isReconnect) {
                // join room by id
                roomId = yield this.joinById(roomToJoin, clientOptions, isReconnect && sessionId);
            }
            else if (!hasHandler) {
                throw new Errors_1.MatchMakeError(`Failed to join invalid room "${roomToJoin}"`);
            }
            if (!roomId && !isReconnect) {
                // when multiple clients request to create a room simultaneously, we need
                // to wait for the first room to be created to prevent creating multiple of them
                yield this.awaitRoomAvailable(roomToJoin);
                // check if there's an existing room with provided name available to join
                const availableRoomsByScore = yield this.getAvailableRoomByScore(roomToJoin, clientOptions);
                for (let i = 0, l = availableRoomsByScore.length; i < l; i++) {
                    roomId = yield this.joinById(availableRoomsByScore[i].roomId, clientOptions);
                    // couldn't join this room, skip
                    if (!roomId) {
                        continue;
                    }
                    if (yield this.remoteRoomCall(roomId, '_reserveSeat', [{
                            id: client.id,
                            sessionId,
                        }])) {
                        // seat reservation was successful, no need to try other rooms.
                        shouldCreateRoom = false;
                        break;
                    }
                    else {
                        shouldCreateRoom = true;
                    }
                }
            }
            // if couldn't join a room by its id, let's try to create a new one
            if (shouldCreateRoom) {
                roomId = yield this.create(roomToJoin, clientOptions);
            }
            if (!roomId) {
                throw new Errors_1.MatchMakeError(`Failed to join invalid room "${roomToJoin}"`);
            }
            else if (shouldCreateRoom || isJoinById) {
                const reserveSeatSuccessful = yield this.remoteRoomCall(roomId, '_reserveSeat', [{
                        id: client.id,
                        sessionId,
                    }]);
                if (!reserveSeatSuccessful) {
                    throw new Errors_1.MatchMakeError('join_request_fail');
                }
            }
            return roomId;
        });
    }
    remoteRoomCall(roomId, method, args, rejectionTimeout = exports.REMOTE_ROOM_SHORT_TIMEOUT) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = this.localRooms[roomId];
            if (!room) {
                return new Promise((resolve, reject) => {
                    let unsubscribeTimeout;
                    const requestId = index_1.generateId();
                    const channel = `${roomId}:${requestId}`;
                    const unsubscribe = () => {
                        this.presence.unsubscribe(channel);
                        clearTimeout(unsubscribeTimeout);
                    };
                    this.presence.subscribe(channel, (message) => {
                        const [code, data] = message;
                        if (code === Protocol_1.IpcProtocol.SUCCESS) {
                            resolve(data);
                        }
                        else if (code === Protocol_1.IpcProtocol.ERROR) {
                            reject(data);
                        }
                        unsubscribe();
                    });
                    this.presence.publish(this.getRoomChannel(roomId), [method, requestId, args]);
                    unsubscribeTimeout = setTimeout(() => {
                        unsubscribe();
                        const request = `${method}${args && ' with args ' + JSON.stringify(args) || ''}`;
                        reject(new Error(`remote room (${roomId}) timed out, requesting "${request}". ` +
                            `Timeout setting: ${rejectionTimeout}ms`));
                    }, rejectionTimeout);
                });
            }
            else {
                if (!args && typeof (room[method]) !== 'function') {
                    return room[method];
                }
                return room[method].apply(room, args);
            }
        });
    }
    registerHandler(name, klass, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredHandler = new RegisteredHandler_1.RegisteredHandler(klass, options);
            this.handlers[name] = registeredHandler;
            yield this.cleanupStaleRooms(name);
            return registeredHandler;
        });
    }
    hasHandler(name) {
        return this.handlers[name] !== undefined;
    }
    joinById(roomId, clientOptions, rejoinSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.presence.exists(this.getRoomChannel(roomId));
            if (!exists) {
                Debug_1.debugMatchMaking(`trying to join non-existant room "${roomId}"`);
                return;
            }
            else if (rejoinSessionId && (yield this.remoteRoomCall(roomId, 'hasReservedSeat', [rejoinSessionId]))) {
                return roomId;
            }
            else if (yield this.remoteRoomCall(roomId, 'hasReachedMaxClients')) {
                Debug_1.debugMatchMaking(`room "${roomId}" reached maxClients.`);
                return;
            }
            else if (!(yield this.remoteRoomCall(roomId, 'requestJoin', [clientOptions, false]))) {
                Debug_1.debugMatchMaking(`can't join room "${roomId}" with options: ${JSON.stringify(clientOptions)}`);
                return;
            }
            return roomId;
        });
    }
    getAvailableRoomByScore(roomName, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRoomsWithScore(roomName, clientOptions)).
                sort((a, b) => b.score - a.score);
        });
    }
    create(roomName, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredHandler = this.handlers[roomName];
            const room = new registeredHandler.klass();
            // set room public attributes
            room.roomId = index_1.generateId();
            room.roomName = roomName;
            room.presence = this.presence;
            if (room.onInit) {
                yield room.onInit(Utils_1.merge({}, clientOptions, registeredHandler.options));
            }
            // imediatelly ask client to join the room
            if (room.requestJoin(clientOptions, true)) {
                Debug_1.debugMatchMaking('spawning \'%s\' (%s) on process %d', roomName, room.roomId, process.pid);
                room.on('lock', this.lockRoom.bind(this, roomName, room));
                room.on('unlock', this.unlockRoom.bind(this, roomName, room));
                room.on('join', this.onClientJoinRoom.bind(this, room));
                room.on('leave', this.onClientLeaveRoom.bind(this, room));
                room.once('dispose', this.disposeRoom.bind(this, roomName, room));
                // room always start unlocked
                yield this.createRoomReferences(room, true);
                registeredHandler.emit('create', room);
                return room.roomId;
            }
            else {
                room._dispose();
                throw new Errors_1.MatchMakeError(`Failed to auto-create room "${roomName}" during ` +
                    `join request using options "${JSON.stringify(clientOptions)}"`);
            }
        });
    }
    getAvailableRooms(roomName, roomMethodName = 'getAvailableData') {
        return __awaiter(this, void 0, void 0, function* () {
            const roomIds = yield this.presence.smembers(roomName);
            const availableRooms = [];
            yield Promise.all(roomIds.map((roomId) => __awaiter(this, void 0, void 0, function* () {
                let availability;
                try {
                    availability = yield this.remoteRoomCall(roomId, roomMethodName);
                }
                catch (e) {
                    // room did not respond
                }
                if (availability) {
                    availableRooms.push(availability);
                }
                return true;
            })));
            return availableRooms;
        });
    }
    getAllRooms(roomName, roomMethodName = 'getAvailableData') {
        return __awaiter(this, void 0, void 0, function* () {
            const roomIds = yield this.presence.smembers(`a_${roomName}`);
            const rooms = [];
            yield Promise.all(roomIds.map((roomId) => __awaiter(this, void 0, void 0, function* () {
                let availability;
                try {
                    availability = yield this.remoteRoomCall(roomId, roomMethodName);
                }
                catch (e) {
                    // room did not respond
                }
                if (availability) {
                    rooms.push(availability);
                }
                return true;
            })));
            return rooms;
        });
    }
    // used only for testing purposes
    getRoomById(roomId) {
        return this.localRooms[roomId];
    }
    gracefullyShutdown() {
        if (this.isGracefullyShuttingDown) {
            return Promise.reject(false);
        }
        this.isGracefullyShuttingDown = true;
        const promises = [];
        for (const roomId in this.localRooms) {
            if (!this.localRooms.hasOwnProperty(roomId)) {
                continue;
            }
            const room = this.localRooms[roomId];
            promises.push(room.disconnect());
        }
        return Promise.all(promises);
    }
    cleanupStaleRooms(roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            // clean-up possibly stale room ids
            // (ungraceful shutdowns using Redis can result on stale room ids still on memory.)
            //
            const roomIds = yield this.presence.smembers(`a_${roomName}`);
            // remove connecting counts
            yield this.presence.del(this.getHandlerConcurrencyKey(roomName));
            yield Promise.all(roomIds.map((roomId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // use hardcoded short timeout for cleaning up stale rooms.
                    yield this.remoteRoomCall(roomId, 'roomId');
                }
                catch (e) {
                    Debug_1.debugMatchMaking(`cleaning up stale room '${roomName}' (${roomId})`);
                    this.clearRoomReferences({ roomId, roomName });
                    this.presence.srem(`a_${roomName}`, roomId);
                }
            })));
        });
    }
    getRoomsWithScore(roomName, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomsWithScore = [];
            const roomIds = yield this.presence.smembers(roomName);
            const remoteRequestJoins = [];
            yield Promise.all(roomIds.map((roomId) => __awaiter(this, void 0, void 0, function* () {
                let maxClientsReached;
                try {
                    maxClientsReached = yield this.remoteRoomCall(roomId, 'hasReachedMaxClients');
                }
                catch (e) {
                    // room did not responded.
                    maxClientsReached = true;
                }
                // check maxClients before requesting to join.
                if (maxClientsReached) {
                    return;
                }
                const localRoom = this.localRooms[roomId];
                if (!localRoom) {
                    remoteRequestJoins.push(new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const score = yield this.remoteRoomCall(roomId, 'requestJoin', [clientOptions, false]);
                        resolve({ roomId, score });
                    })));
                }
                else {
                    roomsWithScore.push({
                        roomId,
                        score: localRoom.requestJoin(clientOptions, false),
                    });
                }
                return true;
            })));
            return (yield Promise.all(remoteRequestJoins)).concat(roomsWithScore);
        });
    }
    createRoomReferences(room, init = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.localRooms[room.roomId] = room;
            // add unlocked room reference
            yield this.presence.sadd(room.roomName, room.roomId);
            if (init) {
                // add alive room reference (a=all)
                yield this.presence.sadd(`a_${room.roomName}`, room.roomId);
                yield this.presence.subscribe(this.getRoomChannel(room.roomId), (message) => {
                    const [method, requestId, args] = message;
                    const reply = (data) => {
                        this.presence.publish(`${room.roomId}:${requestId}`, data);
                    };
                    // reply with property value
                    if (!args && typeof (room[method]) !== 'function') {
                        return reply([Protocol_1.IpcProtocol.SUCCESS, room[method]]);
                    }
                    // reply with method result
                    let response;
                    try {
                        response = room[method].apply(room, args);
                    }
                    catch (e) {
                        Debug_1.debugAndPrintError(e.stack || e);
                        return reply([Protocol_1.IpcProtocol.ERROR, e.message || e]);
                    }
                    if (!(response instanceof Promise)) {
                        return reply([Protocol_1.IpcProtocol.SUCCESS, response]);
                    }
                    response.
                        then((result) => reply([Protocol_1.IpcProtocol.SUCCESS, result])).
                        catch((e) => {
                        // user might have called `reject()` without arguments.
                        const err = e && e.message || e;
                        reply([Protocol_1.IpcProtocol.ERROR, err]);
                    });
                });
            }
            return true;
        });
    }
    clearRoomReferences(room) {
        this.presence.srem(room.roomName, room.roomId);
        // clear list of connecting clients.
        this.presence.del(room.roomId);
    }
    awaitRoomAvailable(roomToJoin) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.getHandlerConcurrencyKey(roomToJoin);
            const concurrency = (yield this.presence.incr(key)) - 1;
            this.presence.decr(key);
            if (concurrency > 0) {
                // avoid having too long timeout if 10+ clients ask to join at the same time
                const concurrencyTimeout = Math.min(concurrency * 100, exports.REMOTE_ROOM_SHORT_TIMEOUT);
                Debug_1.debugMatchMaking('receiving %d concurrent requests for joining \'%s\' (waiting %d ms)', concurrency, roomToJoin, concurrencyTimeout);
                return yield new Promise((resolve, reject) => setTimeout(resolve, concurrencyTimeout));
            }
            else {
                return true;
            }
        });
    }
    getRoomChannel(roomId) {
        return `$${roomId}`;
    }
    getHandlerConcurrencyKey(name) {
        return `${name}:c`;
    }
    onClientJoinRoom(room, client) {
        this.handlers[room.roomName].emit('join', room, client);
    }
    onClientLeaveRoom(room, client) {
        this.handlers[room.roomName].emit('leave', room, client);
    }
    lockRoom(roomName, room) {
        this.clearRoomReferences(room);
        // emit public event on registered handler
        this.handlers[room.roomName].emit('lock', room);
    }
    unlockRoom(roomName, room) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.createRoomReferences(room)) {
                // emit public event on registered handler
                this.handlers[room.roomName].emit('unlock', room);
            }
        });
    }
    disposeRoom(roomName, room) {
        Debug_1.debugMatchMaking('disposing \'%s\' (%s) on process %d', roomName, room.roomId, process.pid);
        // emit disposal on registered session handler
        this.handlers[roomName].emit('dispose', room);
        // remove from alive rooms
        this.presence.srem(`a_${roomName}`, room.roomId);
        // remove concurrency key
        this.presence.del(this.getHandlerConcurrencyKey(roomName));
        // remove from available rooms
        this.clearRoomReferences(room);
        // unsubscribe from remote connections
        this.presence.unsubscribe(this.getRoomChannel(room.roomId));
        // remove actual room reference
        delete this.localRooms[room.roomId];
    }
}
exports.MatchMaker = MatchMaker;
