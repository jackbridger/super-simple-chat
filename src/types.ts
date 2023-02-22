import { Socket } from "socket.io"

export interface TypedRequestBody<T> extends Express.Request {
    body: T
  }
export interface TypedRequestBodyWithHeader<T> extends Express.Request {
    body: T
    headers:{
        authorization:string
    }
  }
  
export interface TypedRequestQuery<T> extends Express.Request {
    query: T
}

export interface TypedRequestQueryWithBodyAndParams<Params, ReqBody> extends Express.Request {
    body: ReqBody,
    params: Params
}

export interface TypedRequestQueryAndParams<Params, Query> extends Express.Request {
    params: Params
    query: Query,
}

export interface TypedRequestQueryWithParams<Params> extends Express.Request {
    params: Params
}

export interface User {
    external_user_id: string;
    id: string;
    // display_name:string;
    // created_at: string;
}

export interface Channel {
    id: string;
    name: string;
    owner_user_id: string | null;
    created_at: string;
    updated_at:string;
    participants?: User[];
}

export interface Message {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
}

export interface UserChannel {
    user_id: string;
    channel_id: string;
}

export interface SocketConnectedUsers {
    [key: string]: {
        socketID: string;
        socket: Socket;
        user: User;
    }
}
export interface SocketChannel {
    [key: string]: {
        socketId: string;
        socket: Socket;
    }
}

export interface SocketSocketIdUserId {
    [key: string]: string
}

export interface UserPayLoad {
    userID:string;
    companyID:string;
    appID:string;
    externalUserID:string;
    iat:number;
    exp:number
  }