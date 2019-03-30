import { MapSchema, Schema } from '@colyseus/schema';
import { Client } from '.';
import { Room } from './Room';
declare class Player extends Schema {
    id: string;
    connected: boolean;
    isMaster: boolean;
}
declare class State {
    players: MapSchema<Player>;
}
/**
 * client.join("punroom", {
 *   create: true,
 *   maxClients: 10,
 *   allowReconnectionTime: 20
 * });
 */
export declare class PUNRoom extends Room<State> {
    allowReconnectionTime: number;
    requestJoin(options: any, isNewRoom: boolean): boolean;
    onInit(options: any): void;
    onJoin(client: Client, options: any): void;
    onMessage(client: Client, message: any): void;
    onLeave(client: Client, consented: boolean): Promise<void>;
}
export {};
