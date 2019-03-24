export declare function subscribe(topic: string, callback: Function): void;
export declare function unsubscribe(topic: string, callback?: Function): void;
export declare function publish(topic: string, message: any, isDispatching?: boolean): void;
export declare function pubsub(topic: string, callback: Function): number[];
