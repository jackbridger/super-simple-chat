import { Response,Request } from "express"
import supabase from "../utils/supabase"
import { TypedRequestBody, TypedRequestQuery, TypedRequestQueryWithParams } from "../types"
import { extractDataFromRequestWithJWT } from "../utils/auth"

// export const createUser = async function (req: TypedRequestBody<{username: string;app_id:string}>, res: Response) {
//     const dataFromJWT = extractDataFromJWT(req as Request)
//     if (!dataFromJWT) return res.sendStatus(401);
//     const {appID} = dataFromJWT

//     const userID = await addUser(req.body.username)
//     if (!userID) return res.sendStatus(500)
//     const appUserID = await addUserToApp(userID,appID)
//     if (!appUserID) return res.sendStatus(500)
//     return res.send(userID)
// }
export const createUserNotReq = async function (externalUserID: string,appID:string, displayName:string) {
    
    const userID = await addUser(displayName)
    if (!userID) {
        throw new Error("Could not create user")
    }
    const appUserID = await addUserToApp(userID,appID,externalUserID)
    if (!appUserID) {
        throw new Error("Could not create user")
    }
    return userID
}

const addUser = async function(displayName:string){
    const { data, error } = await supabase
        .from('users')
        .upsert({ 
            display_name: displayName
        })
        .select()
    if (error) {
        return null
    } else {
        return data[0].id
    }
}
const addUserToApp = async function(userID:string,appID:string,externalUserID:string){
    const { data, error } = await supabase
        .from('app_user')
        .upsert({ 
            user_id: userID,
            external_user_id: externalUserID,
            app_id: appID
        })
        .select()
    if (error) {
        return null
    } else {
        return data[0].id
    }
}


export const getAllUsers = async function (req: Request, res: Response) {
    const dataFromJWT = extractDataFromRequestWithJWT(req as Request)
    if (!dataFromJWT) return res.sendStatus(401);
    const {appID} = dataFromJWT
    const { data, error } = await supabase
    .from('app_user')
    .select(`users(display_name),external_user_id)`)
    .eq('app_id', appID)

    if (error) {
        return res.sendStatus(500)
    } else {
        const newData = data.map((item:any) => {
            return {
                display_name: item.users.display_name,
                id: item.external_user_id
            }
        })
        return res.send(newData)
    }
}
export const getUserByID = async function (req: TypedRequestQueryWithParams<{user_id: string}>, res: Response) {
    const userID = req.params.user_id
    const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userID)
    if (error) {
        res.sendStatus(500)
    } else {
        res.send(data[0])
    }
}
export const updateCurrentUser = async function (req: TypedRequestBody<{display_name: string}>, res: Response) {
    // Note these are for updating the current user
    // If we want to update a user by ID, we need an admin route
    const dataFromJWT = extractDataFromRequestWithJWT(req as Request)
    if (!dataFromJWT) return res.sendStatus(401);
    const {userID} = dataFromJWT

    const newDisplayName = req.body.display_name

    try {
        const { data, error } = await supabase
        .from('users')
        .update({
            display_name: newDisplayName
        })
        .eq('id', userID)
        .select()

    if (error) {
        console.log(error)
        return res.sendStatus(400)
    } else {

        return res.sendStatus(200)
    }
    }catch(err){
        console.log(err)
        return  res.sendStatus(401)
    }
  
}
export const deleteUserByID = async function (req: TypedRequestQueryWithParams<{user_id: string}>, res: Response) {
    const userID = req.params.user_id

    try{
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', userID)
        if (error) {
            console.log(error)
            return res.sendStatus(500)
        } else {
            return res.send(data[0])
        }
        }catch(err){
            console.log(err)
            return res.sendStatus(500)
        }
}
export const deleteCurrentUser = async function (req:Request, res: Response) {
    const dataFromJWT = extractDataFromRequestWithJWT(req as Request)
    if (!dataFromJWT) return res.sendStatus(401);
    const {userID} = dataFromJWT

    const removedFromApp = await removeUserFromApp(userID)
    if (!removedFromApp) return res.sendStatus(500)
    const removedUser = await removeUser(userID)
    if (!removedUser) return res.sendStatus(500)
    return res.sendStatus(200)
}
const removeUser = async function(userID:string){
    try{
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', userID)
            .select()
        if (error) {
            console.log(error)
            return null
        } else {
            return data[0]
        }
        }catch(err){
            console.log(err)
            return null
        }
}
const removeUserFromApp = async function(userID:string){
    try{
        const { data, error } = await supabase
            .from('app_user')
            .delete()
            .eq('user_id', userID)
            .select()
        if (error) {
            console.log(error)
            return null
        } else {
            return data[0]
        }
        }catch(err){
            console.log(err)
            return null
        }
}



export const searchUsers =   async function (req: TypedRequestQuery<{user_id: string, q: string}>, res: Response) {
    // To do - make sure matches what I put in api
    // To do - make sure they are in the same app
    let query = supabase
      .from('users')
      .select();
    
    if (req.query.q) {
        query = query.like('username', `%${req.query.q}%`)
    }

    query = query.neq('id', req.query.user_id)
    .limit(50);
  
    const { data, error } = await query;
    
    if (error) {
        return res.sendStatus(500)
    } else {
        return res.send(data)
    }
}

// export const connectUser = async function (req: TypedRequestBody<{username: string}>, res: Response) {
//     // TODO - write this code
//     const { data, error } = await supabase
//         .from('users')
//         .upsert({ 
//             username: req.body.username,
//             created_at: ((new Date()).toISOString()).toLocaleString()
//         })
//         .select()

//     if (error) {
//         return res.sendStatus(500)
//     } else {
//         return res.send(data[0])
//     }
// }