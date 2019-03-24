/// <reference types="node" />
import { EventEmitter } from 'events';
import { Client } from './../index';
import { Presence } from './Presence';
export declare class RemoteClient extends EventEmitter {
    id: string;
    sessionId: string;
    protected readyState: number;
    protected roomId: string;
    protected presence: Presence;
    constructor(client: Client, roomId: string, presence: Presence);
    send(buffer: Buffer): void;
    close(code?: number): void;
}
