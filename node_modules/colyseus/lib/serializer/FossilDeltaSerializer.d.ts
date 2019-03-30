import { Schema } from '@colyseus/schema';
import { Client } from '..';
import { Serializer } from './Serializer';
export declare class FossilDeltaSerializer<T> implements Serializer<T> {
    id: string;
    private previousState;
    private previousStateEncoded;
    private patches;
    reset(newState: T): void;
    getFullState(client: Client): any;
    applyPatches(clients: Client[], previousState: T | Schema): boolean;
    hasChanged(newState: T | Schema): boolean;
}
