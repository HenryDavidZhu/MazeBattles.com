import { Serializer } from './Serializer';
import { Client } from '..';
/**
 * This serializer is not meant to be used.
 * It just ilustrates how you can implement your own data serializer.
 */
export declare class JSONPatchSerializer<T> implements Serializer<T> {
    id: string;
    private state;
    private observer;
    private patches;
    reset(newState: any): void;
    getFullState(): string;
    applyPatches(clients: Client[], newState: T): boolean;
    hasChanged(newState: any): boolean;
}
