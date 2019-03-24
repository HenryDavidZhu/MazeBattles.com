"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class RegisteredHandler extends events_1.EventEmitter {
    constructor(klass, options) {
        super();
        this.klass = klass;
        this.options = options;
    }
}
exports.RegisteredHandler = RegisteredHandler;
