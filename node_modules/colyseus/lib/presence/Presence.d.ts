export interface Presence {
    subscribe(topic: string, callback: Function): any;
    unsubscribe(topic: string): any;
    publish(topic: string, data: any): any;
    exists(roomId: string): Promise<boolean>;
    setex(key: string, value: string, seconds: number): any;
    get(key: string): any;
    del(key: string): void;
    sadd(key: string, value: any): any;
    smembers(key: string): any;
    srem(key: string, value: any): any;
    scard(key: string): any;
    hset(roomId: string, key: string, value: string): any;
    hget(roomId: string, key: string): Promise<string>;
    hdel(roomId: string, key: string): any;
    hlen(roomId: string): Promise<number>;
    incr(key: string): any;
    decr(key: string): any;
}
