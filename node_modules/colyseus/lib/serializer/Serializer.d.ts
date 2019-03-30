import { Client } from '..';
export declare function serialize(serializer: new () => Serializer<any>): (constructor: Function) => void;
export interface Serializer<T> {
    id: string;
    reset(data: any): void;
    getFullState(client: Client): any;
    applyPatches(clients: Client[], state: T): boolean;
    handshake?(): number[];
}
