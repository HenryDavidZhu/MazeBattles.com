import { Client } from './index';
import { RoomAvailable } from './Room';
export declare const WS_CLOSE_CONSENTED = 4000;
export declare enum Protocol {
    USER_ID = 1,
    JOIN_REQUEST = 9,
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
export declare const send: {
    [Protocol.USER_ID]: (client: Client) => void;
    [Protocol.JOIN_ERROR]: (client: Client, message: string) => void;
    [Protocol.JOIN_REQUEST]: (client: Client, requestId: number, roomId: string) => void;
    [Protocol.JOIN_ROOM]: (client: Client, sessionId: string, serializerId: string, handshake?: number[]) => void;
    [Protocol.ROOM_STATE]: (client: Client, bytes: number[]) => void;
    [Protocol.ROOM_STATE_PATCH]: (client: Client, bytes: number[]) => void;
    [Protocol.ROOM_DATA]: (client: Client, data: any, encode?: boolean) => void;
    [Protocol.ROOM_LIST]: (client: Client, requestId: number, rooms: RoomAvailable[]) => void;
};
export declare function utf8Write(buff: Buffer, offset: number, str?: string): void;
export declare function utf8Length(str?: string): number;
