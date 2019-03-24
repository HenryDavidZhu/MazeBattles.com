import { Client } from './index';
export declare const WS_CLOSE_CONSENTED = 4000;
export declare enum Protocol {
    USER_ID = 1,
    JOIN_ROOM = 10,
    JOIN_ERROR = 11,
    LEAVE_ROOM = 12,
    ROOM_DATA = 13,
    ROOM_STATE = 14,
    ROOM_STATE_PATCH = 15,
    ROOM_LIST = 20,
    BAD_REQUEST = 50,
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202
}
export declare enum IpcProtocol {
    SUCCESS = 0,
    ERROR = 1,
    TIMEOUT = 2
}
export declare function decode(message: any): any;
export declare function send(client: Client, message: any, encode?: boolean): void;
