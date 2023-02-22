import { Server,Socket as SocketType } from "socket.io";
import { SocketConnectedUsers, SocketSocketIdUserId, User, Message, Channel, SocketChannel } from '../types';
import { extractDataFromJWT } from "./auth";
import supabase from "../utils/supabase";
const NEW_MESSAGE = 'new_message';
const NEW_CHANNEL = 'new_channel';

class Socket {
    private static _instance: Socket;

    private io;
    private users: SocketConnectedUsers = {};
    private socketIdUserId: SocketSocketIdUserId = {};
    private channels: SocketChannel = {};

    private constructor(server: Server) {
        this.io = server;
        this.io.on('connection', async socket =>{
            const user = await _initUser(socket)
            if (!user) return
            const {userID,externalUserID} = user
            this.users[userID] = {socketID:socket.id, socket:socket,user:{
                id:userID,
                external_user_id:externalUserID
            }}
            const channelsList = await _getChannelsList(userID)
            if (!channelsList) return
            _joinChannels(socket,channelsList)
            socket.on('disconnect', (disconnectReason:string) => {
                console.log(`${externalUserID} disconnected because ${disconnectReason}`)
                delete this.users[userID]
            });
        })
    }
    public static notifyNewMessage  (channelID:string, message: string) {
        this._instance.io.to(channelID).emit(NEW_MESSAGE, message);
    }

    public static notifyNewChannel (channelID:string, channel: string,externalUserIDs:string[],appID:string) {
        _getUserIDsFromExternalIDs(externalUserIDs,appID).then((participantIDs) => {
                    participantIDs.forEach((participantID:string) => {
                        if (this._instance.users[participantID]){
                            console.log("sending a notification to ", participantID)
                            this._instance.users[participantID].socket.emit(NEW_CHANNEL, channel);
                        }
                    })
        })
    }
    static getInstance(server?: Server) {
        if (this._instance) {
            return this._instance;
        }

        if (server) {
            this._instance = new Socket(server);
            return this._instance;
        }

        return Error("Failed to init socket");
    }
}

const _getallChannelsByUserId = async (userID: string) => {
    const { data, error } = await supabase
        .from('channel_user')
        .select('channel_id')
        .eq('user_id', userID)
    if (error) {
        console.log(error)
        return null
    }
    const resData = [...new Set(data.map(channel => channel.channel_id))]
    return resData as string[]
}

const _getChannelsList = async (userID:string) => {

    const channelsList = await _getallChannelsByUserId(userID)
    return channelsList
}
const _joinChannels = (socket:SocketType,channelsList:string[]) => {
    channelsList.forEach((channelID:string) => {
        socket.join(channelID)
    })
}

const _initUser = async (socket:SocketType) => {
    const token = socket.handshake.auth.token
    if (!token) return
    const jwtData = extractDataFromJWT(token)
    if (!jwtData) return
    const {userID,appID,companyID,externalUserID} = jwtData
    return ({userID,appID,companyID,externalUserID})
}
const _getUserIDsFromExternalIDs = async (externalUserIDs:string[],appID:string) => {
    const resData = Promise.all(externalUserIDs.map(async (externalUserID:string) => {        
        const { data, error } = await supabase
            .from('app_user')
            .select('user_id')
            .eq('external_user_id', externalUserID)
            .eq('app_id', appID)
            .single()
        if (error) {
            console.log(error)
            throw error
        }
        else {
            return data.user_id as string
        }
    }))
    return resData
}

export default Socket;