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
const Utils_1 = require("../Utils");
class LocalPresence {
    constructor() {
        this.channels = {};
        this.data = {};
        this.hash = {};
        this.keys = {};
        this.timeouts = {};
    }
    subscribe(topic, callback) {
        this.channels[topic] = true;
        return this;
    }
    unsubscribe(topic) {
        this.channels[topic] = false;
        return this;
    }
    publish(topic, data) {
        return this;
    }
    exists(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.channels[roomId];
        });
    }
    setex(key, value, seconds) {
        // ensure previous timeout is clear before setting another one.
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
        }
        this.keys[key] = value;
        this.timeouts[key] = setTimeout(() => {
            delete this.keys[key];
            delete this.timeouts[key];
        }, seconds * 1000);
    }
    get(key) {
        return this.keys[key];
    }
    del(key) {
        delete this.data[key];
        delete this.hash[key];
    }
    sadd(key, value) {
        if (!this.data[key]) {
            this.data[key] = [];
        }
        if (this.data[key].indexOf(value) === -1) {
            this.data[key].push(value);
        }
    }
    smembers(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data[key] || [];
        });
    }
    srem(key, value) {
        if (this.data[key]) {
            Utils_1.spliceOne(this.data[key], this.data[key].indexOf(value));
        }
    }
    scard(key) {
        return this.data[key].length;
    }
    hset(roomId, key, value) {
        if (!this.hash[roomId]) {
            this.hash[roomId] = {};
        }
        this.hash[roomId][key] = value;
    }
    hget(roomId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.hash[roomId] && this.hash[roomId][key];
        });
    }
    hdel(roomId, key) {
        if (this.hash[roomId]) {
            delete this.hash[roomId][key];
        }
    }
    hlen(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.hash[roomId] && Object.keys(this.hash[roomId]).length || 0;
        });
    }
    incr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.keys[key]) {
                this.keys[key] = 0;
            }
            this.keys[key]++;
            return this.keys[key];
        });
    }
    decr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.keys[key]) {
                this.keys[key] = 0;
            }
            this.keys[key]--;
            return this.keys[key];
        });
    }
}
exports.LocalPresence = LocalPresence;
