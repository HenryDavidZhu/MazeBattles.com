import { Presence } from './Presence';
export declare class LocalPresence implements Presence {
    channels: {
        [roomId: string]: boolean;
    };
    data: {
        [roomName: string]: string[];
    };
    hash: {
        [roomName: string]: {
            [key: string]: string;
        };
    };
    keys: {
        [name: string]: string | number;
    };
    private timeouts;
    subscribe(topic: string, callback: Function): this;
    unsubscribe(topic: string): this;
    publish(topic: string, data: any): this;
    exists(roomId: string): Promise<boolean>;
    setex(key: string, value: string, seconds: number): void;
    get(key: string): string | number;
    del(key: string): void;
    sadd(key: string, value: any): void;
    smembers(key: string): Promise<string[]>;
    srem(key: string, value: any): void;
    scard(key: string): number;
    hset(roomId: string, key: string, value: string): void;
    hget(roomId: string, key: string): Promise<string>;
    hdel(roomId: string, key: any): void;
    hlen(roomId: string): Promise<number>;
    incr(key: string): Promise<string | number>;
    decr(key: string): Promise<string | number>;
}
