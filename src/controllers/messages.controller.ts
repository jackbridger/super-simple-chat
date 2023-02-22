import { Response,Request } from "express"
import supabase from "../utils/supabase"
import Socket from '../utils/socket';
import { 
  TypedRequestQueryWithParams, 
    Message,
    TypedRequestBody,
    TypedRequestQuery,
    TypedRequestQueryWithBodyAndParams
} from '../types';
import { extractDataFromRequestWithJWT } from "../utils/auth";


export const sendMessageToChannel = async function (req: TypedRequestBody<{message: string,channel_id:string}>, res: Response) {
  if (!req.body) {
    return res.status(400).json({
        message:"No body. Please provide a 'channel_id' - a unique id for the channel and  also message - the message you want to send."
    })
  }
  if (!req.body.channel_id && !req.body.message){
    return res.status(400).json({
        message:"Please provide a 'channel_id' and 'message' in the body of your request. channel_id is the public name of the channel you are creating. message is the message you are sending"
    })
  }
  if (!req.body.channel_id){ 
      return res.status(400).json({
      message:"Please provide a 'channel_id' in the body of your request. channel_id is the public name of the channel you are creating."
  })}
  if (!req.body.message){ 
      return res.status(400).json({
      message:"Please provide a 'message' in the body of your request. message is the message you are sending"
  })}
  
    const channelID = req.body.channel_id
    const message = req.body.message

    const dataFromJWT = extractDataFromRequestWithJWT(req as Request)
    if (!dataFromJWT) {
        return res.sendStatus(401)
    }
    const {userID}= dataFromJWT

    const messageID = await addMessage(message)
    if (!messageID){return res.sendStatus(500)}
    const messageUserID = await addMessageToUser(messageID,userID)
    if (!messageUserID){return res.sendStatus(500)}
    const messageChannelID = await addMessageToChannel(messageID,channelID)
    if (!messageChannelID) {return res.sendStatus(500)}
    console.log("about to send a broadcast")
    Socket.notifyNewMessage(channelID, message)
    return res.send(messageID)
    
    
    
    // add message to user
    // add message to channel

    // TO DO - fix up the socket io stuff

    // get the users in this chat, except for the current one
    // const userChannelIds = await supabase
    //     .from('channel_user')
    //     .select('user_id')
    //     .eq('channel', channelID)
    // To Do: get this working again
    // if (data.error) {
    //     res.send(500)
    // } else {
    //     if (userChannelIds.data && userChannelIds.data?.length > 0) {
    //         const userIdsForMessages = userChannelIds.data.map((item) => item.user_id).filter((item) => item !== user_id);
    //         Socket.sendMessageToUsers(userIdsForMessages as string[], data.data[0] as Message)
    //     }

    //     res.send(
    //         data.data[0]
    //     )
    // }
}
const addMessage = async function (message:string) {
  try{
    const {error,data} = await supabase
      .from('messages')
      .upsert({ 
        message,
      })
      .select(`
        id
      `)
      if (error){
        console.log(error)
        return null
      }
      return data[0].id
  }catch(err){
    console.log(err)
    return null
  }
}
const addMessageToUser = async function (messageID:string, userID:string) {
    try{
      const {error,data} = await supabase
        .from('user_message')
        .upsert({ 
          message_id:messageID,
          user_id:userID
        })
        .select(`
          id
        `)
        if (error){
          console.log(error)
          return null
        }
        return data[0].id
    }catch(err){
      console.log(err)
      return null
    }
}
const addMessageToChannel = async function (messageID:string, channelID:string) {
  try{
    const {error,data} = await supabase
      .from('channel_message')
      .upsert({ 
        message_id:messageID,
        channel_id:channelID
      })
      .select(`
        id
      `)
      if (error){
        console.log(error)
        return null
      }
      return data[0].id
  }catch(err){
    console.log(err)
    return null
  }
}




export const getMessageByID = async function (req:TypedRequestQueryWithParams <{message_id: string}>, res: Response) {
  const messageID = req.params.message_id

  const { data, error } = await supabase
      .from('messages')
      .select(`*, sender:user_message(username:users(username))`)
      .eq('id', messageID)

  if (error) {
      console.log(error)
      res.sendStatus(500)
  } else {
    const message = data[0]
    const sender = message.sender as {username:{username:string}}[]
    const username = sender[0].username.username
      return res.send({
        id:message.id,
        message:message.message,
        created_at:message.created_at,
        updated_at:message.updated_at,
        username
      })

  }
}

export const updateMessageByID = async function (req: TypedRequestQueryWithBodyAndParams<{message_id: string},{new_message:string}>, res: Response) {
  const messageID = req.params.message_id
  const newMessage = req.body.new_message
  const { data, error } = await supabase
    .from('messages')
    .update({
      message: newMessage
    })
    .eq('id', messageID) 
    .select()
  if (error) {
    console.log(error)
    return res.sendStatus(500)
  } else {
    return res.send(data[0])
  }
}

export const deleteMessageByID = async function (req: TypedRequestQueryWithParams<{message_id: string}>, res: Response) {
  const message_id = req.params.message_id
  const removedMessageUser = await removeMessageUser(message_id)
  if (!removedMessageUser){return res.sendStatus(500)}
  const removedMessageChannel = await removeMessageChannel(message_id)
  if (!removedMessageChannel){return res.sendStatus(500)}
  const deletedMessage = await removeMessage(message_id)
  if (!deletedMessage){return res.sendStatus(500)}
  return res.send(deletedMessage)

  // TODO - write this code
  
}
const removeMessageUser = async function (messageID:string) { 
  const { data, error } = await supabase
  .from('user_message')
  .delete()
  .eq('message_id', messageID) 
  .select()
  if (error) {
    console.log(error)
    return null
  } else {
    return data[0]
  }
}
const removeMessageChannel = async function (messageID:string) { 
  const { data, error } = await supabase
  .from('channel_message')
  .delete()
  .eq('message_id', messageID) 
  .select()
  if (error) {
    console.log(error)
    return null
  } else {
    return data[0]
  }
}

const removeMessage = async function (messageID:string) { 
  const { data, error } = await supabase
  .from('messages')
  .delete()
  .eq('id', messageID) 
  .select()
  if (error) {
    console.log(error)
    return null
  } else {
    return data[0]
  }
}

export const getChannelMessagesByID = async function (req: TypedRequestQueryWithParams<{channel_id: string}>, res: Response) {
  if(!req.params.channel_id) return res.status(400).json({message:"You must provide a channel id"})
  const { channel_id } = req.params;
  try {
      const {error,data} = await supabase
      .from('channel_message')
      .select(`messages(id, message, created_at,updated_at,user_message(users(display_name,app_user(external_user_id) )) ) )`)
      .eq('channel_id', channel_id)
      if (error){
          console.log(error)
          res.sendStatus(500)
      }
      else {
          if (!data) return res.status(404).json({message:"No channel found with that id"})
          const newData = data as any;
          const messages = newData.map((message:any) => message.messages) as any[]
          const formattedMessages = messages.map((message:any) => ({
            id: message.id,
            message: message.message,
            created_at: message.created_at,
            updated_at: message.updated_at,
            user_id: message.user_message[0].users.app_user[0].external_user_id
          } ))

          return res.send(formattedMessages)
      }
  }catch(err){
      console.log(err)
      res.sendStatus(500)
  }
}