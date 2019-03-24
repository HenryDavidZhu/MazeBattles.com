export interface Message {
    cmd: string;
    args?: any[];
    messageId?: string;
    result?: any;
    error?: any;
    pubsub?: boolean;
}
export declare class Store {
    private $callbacks;
    dispatch(cmd: string, callback: Function, ...args: any[]): void;
    consume(message: Message): void;
    buildMessage(command: string, ...args: any[]): Message;
}
