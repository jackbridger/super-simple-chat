import { Response, Request } from "express"
import supabase from "../utils/supabase"
import Socket from '../utils/socket';
import { 
    TypedRequestBody, 
    TypedRequestQueryAndParams,
    TypedRequestQueryWithBodyAndParams,
    TypedRequestQueryWithParams
} from '../types';
import { extractDataFromRequestWithJWT } from "../utils/auth";

export const getAllChannels = async function (req: Request, res: Response) {
    const jwtData = extractDataFromRequestWithJWT(req as Request)
    if (!jwtData) return res.status(401).json({message:"You are not authorized to get channels"});
    const {userID} = jwtData

    const paticipatingChannelIds = await supabase
        .from('channel_user')
        .select('channel_id')
        .eq('user_id', userID)
    
    if (!paticipatingChannelIds.data?.length) {
        return res.send([]);
    }

    const channels = await supabase
        .from('channel_user')
        .select(`channels(*)`)
        .eq('user_id', userID)

    return res.send(channels.data)
}

export const createChannel = async function (req: TypedRequestBody<{participant_ids: string[], name: string}>, res: Response) {
    if (!req.body) {
        return res.status(400).json({
            message:"No body. Please provide a 'name' - the public name of the channel and optionally 'participant_ids' with the id of users in the channel"
        })
    }
    if (!req.body.name){ 
        return res.status(400).json({
        message:"Please provide a 'name' in the body of your request. Name is the public name of the channel you are creating."
    })}

    // if(!req.body.participant_ids.length) return res.sendStatus(400)

    const jwtData = extractDataFromRequestWithJWT(req as Request)

    if (!jwtData) return res.status(401).json({message:"You are not authorized to create a channel"});
    const {userID,appID,externalUserID} = jwtData

    const {
      participant_ids:receievedParticipantIds,
      name,
    } = req.body;

    const participantIDs = receievedParticipantIds ? [...new Set([externalUserID,...receievedParticipantIds])] : [externalUserID]
    // first create the channel 
    const channel = await addChannel(name,userID)
    if (!channel) return res.status(500).json({message:"There was an error creating the channel"})

    const channelID = channel[0].id
    const channelApp = await addChannelToApp(channelID, appID)
    
    if (!channelApp) return res.status(500).json({message:"There was an error adding the new channel to your app"})
    try{
        await addParticipantsToChannel(channelID, participantIDs,appID)
        Socket.notifyNewChannel(channelID,name,participantIDs, appID)
        return res.send(channel)
    }catch(err){
        console.log(err)
        return res.status(500).json({message:`There was an error adding your participants to the channel. ${err}`})
    }
}
const addChannel = async function(name:string,userID:string) {
    try {
        const channel = await supabase
            .from('channels')
            .upsert({ 
                name: name,
                owner_user_id:userID
        })
        .select()
        .single()
    if (channel.error) {
        console.log(channel.error)
        return null
    }
    else return channel.data
    }catch(err){
        console.log(err)
        return null
    }
}
const addChannelToApp = async function(channelID:string, appID:string) {
    const channel = await supabase
        .from('app_channel')
        .upsert({ 
            channel_id: channelID,
            app_id: appID
    })
        .select()

    if (channel.error) {
        console.log(channel.error)
        return null
    }
    else return channel.data
}

const getIDFromExternalID = async function(externalID:string,appID:string) {
    // get the user id from supabase using  the external id
    try{
        const {data,error} = await supabase
            .from('app_user')
            .select('user_id')
            .eq('external_user_id', externalID)
            .eq('app_id', appID)
            .single()
        if (error) {

            console.log(error)
            return null
        }
        if (data){
            return data.user_id
        }
    }catch(err){
        console.log(err)
        return null
    }

}
export const addParticipantsToChannelByID = async function (req: TypedRequestQueryWithBodyAndParams<{channel_id: string},{participant_ids:string[]}>, res: Response) {
    const jwtData = extractDataFromRequestWithJWT(req as unknown as Request)
    if (!jwtData) return res.status(401).json({message:"You are not authorized to add participants to channels"});
    if (!req.params.channel_id) return res.status(400).json({message:"You must provide a channel id in your request. For instance /channels/:channel_id/add-participants"})
    if (!req.body.participant_ids) return res.status(400).json({message:"You must provide a participant_ids array in your request body. For instance {participant_ids: ['1234','5678']}"})
    const {appID} = jwtData
    const channelID = req.params.channel_id;
    const participantIDs = req.body.participant_ids;
    try{
        await addParticipantsToChannel(channelID,participantIDs,appID)
        return res.sendStatus(200)
    }catch(err){
        console.log(err)
        return res.status(500).json({message:`There was an error adding your participants to the channel. ${err}`})
    }
}


const addParticipantsToChannel = async function(channelID:string, participantIDs:string[],appID:string): Promise<void> {
    try{
        participantIDs.forEach(async paricipantExternalID => {
            const participantUserID = await getIDFromExternalID(paricipantExternalID,appID)
            console.log({participantUserID})
            if (!participantUserID) throw new Error("There was an error getting the user id from the external id")
            try{
                const {data,error} = await supabase
                .from('channel_user')
                .upsert({
                    user_id: participantUserID,
                    channel_id: channelID
                })
                .select()
                if (error) {
                    console.log(error)
                    throw error
                }
                console.log(data)

            }catch(err){
                console.log(err)
                throw err
            }
        })

    }catch(err){
        throw err
    }
   
}


export const getChannelMessages = async function (req: TypedRequestQueryAndParams<{channel_id: string} ,{last_message_date: Date}>, res: Response) {
    const { channel_id } = req.params;
    const { last_message_date } = req.query;

    let query = supabase
        .from('messages')
        .select(`
            id,
            channel_id,
            message,
            created_at,
    
            users (
                id,
                username
            )
        `)
        .order('created_at', { ascending: true })
        .eq('channel_id', channel_id)
        
        if (last_message_date){
            query = query.gt('created_at', last_message_date)
        }

    const messages = await query;    

    res.send(messages.data)
}
const fetchChannel = async (channelID:string) => {
    try {
        const {error,data} = await supabase
        .from('channels')
        .select(`*, 
                channel_user(
                    users (
                        app_user (
                            external_user_id
                        )
                    )
                )
                `)
        .eq('id', channelID)
        .single()

        if (error){
            throw error
        }
        else {
            if (!data) return null
            
            const rawUsers = data.channel_user as {users:{app_user:{external_user_id:string}[]}}[]
            const participantIds = rawUsers.map(user => user.users.app_user.map(appUser => appUser.external_user_id)).flat()
            const resData = {
                id: data.id,
                name: data.name,
                owner_user_id: data.owner_user_id,
                participants: participantIds
            }
            return resData
        }
    }catch(err){
        throw err
    }
}

export const getChannelByID = async function (req: TypedRequestQueryWithParams<{channel_id: string}>, res: Response) {
    if(!req.params.channel_id) return res.status(400).json({message:"You must provide a channel id"})
    const { channel_id } = req.params;
    try {
        const channel = await fetchChannel(channel_id)
        return res.send(channel)
    }catch(err){
        console.log(err)
        return res.status(400).json({message:err})
    }
    
}

export const updateChannelByID = async function (req: TypedRequestQueryWithBodyAndParams<{channel_id: string} ,{name:string;owner_user_id:string}>, res: Response) {    
    const { channel_id } = req.params;
    const {name,owner_user_id} = req.body
    const {error,data} = await supabase
        .from('channels')
        .update({name:name,owner_user_id:owner_user_id})
        .eq('id', channel_id)
        .select()
    if (error){
        console.log(error)
        res.sendStatus(500)
    }else {
        res.send(data)
    }

}



export const deleteChannelByID = async function (req: TypedRequestQueryAndParams<{channel_id: string} ,{last_message_date: Date}>, res: Response) {
    const { channel_id:channelID } = req.params;
    const deletedChannelMessages = await removeChannelMessage(channelID)
    if (!deletedChannelMessages) return res.sendStatus(500)
    if (deletedChannelMessages.length === 0){res.status(500).send("No matching channels");}
    const deletedChannelApp = await removeChannelApp(channelID)
    if (!deletedChannelApp) return res.sendStatus(500)
    const deletedChannel = await removeChannel(channelID)
    if (!deletedChannel) return res.sendStatus(500)
    return res.send(deletedChannel)
}

const removeChannel = async function(channelID:string) {
    const {error,data} = await supabase
        .from('channels')
        .delete()
        .eq('id', channelID)
        .select()
    if (error){
        console.log(error)
        return null
    }else {
        return data
    }
}
const removeChannelMessage = async function(channelID:string) {
    const {error,data} = await supabase
        .from('channel_message')
        .delete()
        .eq('channel_id', channelID)
        .select()
    if (error){
        console.log(error)
        return null
    }else {
        return data
    }
}
const removeChannelApp = async function(channelID:string) {
    const {error,data} = await supabase
        .from('app_channel')
        .delete()
        .eq('channel_id', channelID)
        .select()
    if (error){
        console.log(error)
        return null
    }else {
        return data
    }
}