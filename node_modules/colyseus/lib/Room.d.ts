import Clock from '@gamestdio/timer';
import { EventEmitter } from 'events';
import { Client } from '.';
import { Presence } from './presence/Presence';
import { RemoteClient } from './presence/RemoteClient';
import { Serializer } from './serializer/Serializer';
import { Deferred } from './Utils';
export declare type SimulationCallback = (deltaTime?: number) => void;
export declare type RoomConstructor<T = any> = new (presence?: Presence) => Room<T>;
export interface RoomAvailable {
    roomId: string;
    clients: number;
    maxClients: number;
    metadata?: any;
}
export interface BroadcastOptions {
    except?: Client;
    afterNextPatch?: boolean;
}
export declare abstract class Room<T = any> extends EventEmitter {
    clock: Clock;
    roomId: string;
    roomName: string;
    maxClients: number;
    patchRate: number;
    autoDispose: boolean;
    state: T;
    metadata: any;
    presence: Presence;
    clients: Client[];
    protected remoteClients: {
        [sessionId: string]: RemoteClient;
    };
    protected seatReservationTime: number;
    protected reservedSeats: Set<string>;
    protected reservedSeatTimeouts: {
        [sessionId: string]: NodeJS.Timer;
    };
    protected reconnections: {
        [sessionId: string]: Deferred;
    };
    protected isDisconnecting: boolean;
    private _serializer;
    private _afterNextPatchBroadcasts;
    private _simulationInterval;
    private _patchInterval;
    private _locked;
    private _lockedExplicitly;
    private _maxClientsReached;
    private _autoDisposeTimeout;
    constructor(presence?: Presence);
    abstract onMessage(client: Client, data: any): void;
    onInit?(options: any): void;
    onJoin?(client: Client, options?: any, auth?: any): void | Promise<any>;
    onLeave?(client: Client, consented?: boolean): void | Promise<any>;
    onDispose?(): void | Promise<any>;
    requestJoin(options: any, isNew?: boolean): number | boolean;
    onAuth(options: any): boolean | Promise<any>;
    readonly locked: boolean;
    hasReachedMaxClients(): boolean;
    setSeatReservationTime(seconds: number): this;
    hasReservedSeat(sessionId: string): boolean;
    setSimulationInterval(callback: SimulationCallback, delay?: number): void;
    setPatchRate(milliseconds: number): void;
    setState(newState: any): void;
    setMetadata(meta: any): void;
    lock(): void;
    unlock(): void;
    send(client: Client, data: any): void;
    broadcast(data: any, options?: BroadcastOptions): boolean;
    getAvailableData(): Promise<RoomAvailable>;
    disconnect(): Promise<any>;
    readonly serializer: string;
    protected _getSerializer?(): Serializer<T>;
    protected sendState(client: Client): void;
    protected broadcastPatch(): boolean;
    protected broadcastAfterPatch(): void;
    protected allowReconnection(client: Client, seconds?: number): Promise<Client>;
    protected _reserveSeat(client: Client, seconds?: number, allowReconnection?: boolean): Promise<boolean>;
    protected resetAutoDisposeTimeout(timeoutInSeconds: number): void;
    protected _disposeIfEmpty(): boolean;
    protected _dispose(): Promise<any>;
    private _emitOnClient;
    private _onMessage;
    private _onJoin;
    private _onLeave;
}
