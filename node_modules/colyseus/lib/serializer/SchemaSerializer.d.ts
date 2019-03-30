import { Client } from '..';
import { Serializer } from './Serializer';
import { Schema } from '@colyseus/schema';
export declare class SchemaSerializer<T> implements Serializer<T> {
    id: string;
    private state;
    private hasFiltersByClient;
    reset(newState: T & Schema): void;
    getFullState(client: Client): any[];
    applyPatches(clients: Client[]): boolean;
    handshake(): any[];
    private hasFilter;
}
