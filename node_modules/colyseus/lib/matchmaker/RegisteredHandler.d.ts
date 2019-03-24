/// <reference types="node" />
import { EventEmitter } from 'events';
import { RoomConstructor } from './../Room';
export declare class RegisteredHandler extends EventEmitter {
    klass: RoomConstructor;
    options: any;
    constructor(klass: RoomConstructor, options: any);
}
