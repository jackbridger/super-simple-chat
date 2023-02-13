import { Response } from "express"
import supabase from "../utils/supabase"
import { TypedRequestBody, TypedRequestQuery, TypedRequestQueryWithParams } from "../types"

export const createUser = async function (req: TypedRequestBody<{username: string}>, res: Response) {
    const { data, error } = await supabase
        .from('users')
        .upsert({ 
            username: req.body.username,
            created_at: ((new Date()).toISOString()).toLocaleString()
        })
        .select()
    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}
export const getAllUsers = async function (req: TypedRequestBody<{app_id: string;}>, res: Response) {
    // TO DO add pagination
    const appID = req.body.app_id
    const { data, error } = await supabase
    .from('users')
    .select()
    .eq('app_id', appID)

    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}
export const getUserByID = async function (req: TypedRequestQueryWithParams<{user_id: string}>, res: Response) {
    const userID = req.params.user_id

    const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userID)

    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}
export const updateUserByID = async function (req: TypedRequestBody<{new_username: string}>, res: Response) {
    // TO DO - get userID from jwt
    // And test this one
    const userID = ""
    const newUsername = req.body.new_username

    const { data, error } = await supabase
        .from('users')
        .update({
            username: newUsername
        }).eq('id', userID).select()

    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}
export const deleteUserByID = async function (req: TypedRequestBody<{username: string}>, res: Response) {
    // TODO - write this code
    const { data, error } = await supabase
        .from('users')
        .select()

    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}


export const searchUsers =   async function (req: TypedRequestQuery<{user_id: string, q: string}>, res: Response) {
    // To do - make sure matches what I put in api
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
        res.send(500)
    } else {
        res.send(data)
    }
}

export const connectUser = async function (req: TypedRequestBody<{username: string}>, res: Response) {
    // TODO - write this code
    const { data, error } = await supabase
        .from('users')
        .upsert({ 
            username: req.body.username,
            created_at: ((new Date()).toISOString()).toLocaleString()
        })
        .select()

    if (error) {
        res.send(500)
    } else {
        res.send(data[0])
    }
}