import {  Response,Request } from "express"
import jwt from 'jsonwebtoken'
import { 
    TypedRequestBody, 
} from '../types';
import { newAPIKey,isValidAPIKey } from "../utils/auth";
import { createUserNotReq } from "./users.controller";
import supabase from "../utils/supabase";

export const getServerAPIKey = async (req:TypedRequestBody<{appID:string}>, res:Response) => {
   // 
  
  // Get that from Supabase Auth
  const devID = "2a81bd96-7abc-46ea-91b2-e47d7f8f9d0c"
    // CompanyID should come from the users auth id?
    const companyID = "d17f074e-baa9-4391-b24e-0c41f7944553"
    const appID = req.body.appID

    if (!devID){
      return res.status(400).json({ error: 'No no dev id!' });
    }
    if (!appID){
      return res.status(400).json({ error: 'No appID!' });
    }
    if (!companyID){
      return res.status(400).json({ error: 'No company!' });
    }
    //TO DO need to  do the validation on supabase side
    //TO DO Need to put the key in a more secure place etc. and hash it
    const apiKey = await newAPIKey({userID: devID,appID,companyID})
    if (!apiKey){
      return res.status(400).json({ error: 'Could not generate API key!' });
    }
    return res.send(apiKey)
  }

  async function getCompanyIDFromAppID (appID:string) {
    try{
      const { data, error } = await supabase
      .from('company_app')
      .select('company_id')
      .eq('app_id', appID)
      if (error){
          console.log(error)
          return false
      }
      else{
          if (data.length === 0) {
            throw new Error("No company id found")
          }
          if (data.length > 1) {
            throw new Error("MORE THAN ONE APP found")
          }
          const companyID = data[0].company_id
          return companyID
      }
  }catch(err){
    console.log(err)
    throw new Error("Issue get")
  }
  }

  export const createToken = async (req: Request, res: Response) => {
    console.log("inside create token")
    // Registers the user if they don't exist or connects them if they do 
    const jwtKey = process.env.SECRET_JWT_KEY
    if (!req.headers.authorization) {
      return res.status(403).json({ error: 'No server key sent!' });
    }
    if (!jwtKey) throw new Error("No JWT key found")
    // Developer provides this:
    // This is not the developer user, but the end user's user ID
    const externalUserID = req.body.user_id
    console.log(req.body)
    console.log('externalUserID ',externalUserID)
    // They send along app ID
    const appID = req.body.app_id
    const displayName = req.body.display_name ?? ""

    const companyID = await getCompanyIDFromAppID(appID)

    if (!externalUserID){
      return res.status(403).json({error:"No user ID provided"})
    }
    if (!appID){
      return res.status(403).json({error:"No app ID provided"})
    }
    if (!companyID){
      return res.status(403).json({error:"No team"})
    }

    const apikey = req.headers.authorization.split(' ')[1]
  
    const isValid = await isValidAPIKey(appID,apikey)
    if (!isValid){
      return res.status(400).json({ error: 'Invalid API key' });
    }

    const {userID} = await checkIfUserExistsOrCreate(externalUserID,appID,displayName)
  
    const claims = { userID,externalUserID: externalUserID,companyID,appID }
    // To do - make async?
    const token = jwt.sign(claims, jwtKey,{
      expiresIn:60000 // TO DO - need to make this longer & revokable and renewable
    })
    return res.send(token)
  }


  const checkIfUserExistsOrCreate = async (externalUserID:string,appID:string, displayName:string):Promise<{
    userID: string,
    displayName: string
  }> => {
    let userID = null
    const existingUser= await getUserIDIfExistsInApp(externalUserID,appID)
    if (existingUser && existingUser.userID) {
      return {
        userID:existingUser.userID,
        displayName: displayName ? existingUser.displayName : displayName
      }
    }
    userID = await createUserNotReq(externalUserID,appID,displayName)
    return {
      userID:userID,
      displayName: displayName
    }
  }
  const getUserIDIfExistsInApp = async (userID:string,appID:string):Promise<{userID:string; displayName:string} | null> => {
    const { data, error } = await supabase
    .from('app_user')
    .select('user_id, users (display_name)')
    .eq('external_user_id', userID)
    .eq('app_id', appID)
    .single()
    if (error){
        console.log(error)
        return null
    }
    else{
        if (!data.user_id){
          throw new Error("No user id found")
        }
        const userID = data.user_id
        const user = data.users as {display_name:string}
        const displayName = user.display_name
        return ({userID,displayName})
    }

  } 