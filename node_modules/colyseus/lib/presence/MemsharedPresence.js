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
const memshared = require("memshared");
class MemsharedPresence {
    constructor() {
        this.subscriptions = {};
    }
    subscribe(topic, callback) {
        this.subscriptions[topic] = (message) => callback(message);
        memshared.subscribe(topic, this.subscriptions[topic]);
        return this;
    }
    unsubscribe(topic) {
        memshared.unsubscribe(topic, this.subscriptions[topic]);
        delete this.subscriptions[topic];
        return this;
    }
    publish(topic, data) {
        memshared.publish(topic, data);
    }
    exists(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                memshared.pubsub(roomId, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data.length > 0);
                });
            });
        });
    }
    setex(key, value, seconds) {
        memshared.setex(key, seconds, value);
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                memshared.get(key, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    del(roomId) {
        memshared.del(roomId);
    }
    sadd(key, value) {
        memshared.sadd(key, value);
    }
    smembers(key) {
        return new Promise((resolve, reject) => {
            memshared.smembers(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    srem(key, value) {
        memshared.srem(key, value);
    }
    scard(key) {
        return new Promise((resolve, reject) => {
            memshared.scard(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    hset(roomId, key, value) {
        memshared.hset(roomId, key, value);
    }
    hget(roomId, key) {
        return new Promise((resolve, reject) => {
            memshared.hget(roomId, key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    hdel(roomId, key) {
        memshared.hdel(roomId, key);
    }
    hlen(roomId) {
        return new Promise((resolve, reject) => {
            memshared.hlen(roomId, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    incr(key) {
        return new Promise((resolve, reject) => {
            memshared.incr(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    decr(key) {
        return new Promise((resolve, reject) => {
            memshared.decr(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
}
exports.MemsharedPresence = MemsharedPresence;
