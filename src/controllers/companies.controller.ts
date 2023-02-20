import {  Response } from "express"
import { 
    TypedRequestBody, 
} from '../types';
import supabase from "../utils/supabase"

export const createNewCompany = async (req:TypedRequestBody<{name:string,developer_id:string}>, res:Response) => {
    const name = req.body.name
    const developerID = req.body.developer_id
    console.log({developerID})
    console.log({name})
    // create new app in supabase
    const companyID = await addCompany(name,developerID)
    if (!companyID) {
        return res.sendStatus(500)
    }
    console.log({companyID})
    const companyDeveloper = await addCompanyDeveloper(companyID,developerID)
    if (!companyDeveloper) {
        return res.sendStatus(500)
    }
    return res.send(companyID)
  }
  

const addCompany = async (companyName:string,developerID:string) => {
    try {
        const { data, error } = await supabase
        .from('companies')
        .upsert({ 
          name: companyName
         })
        .select()
        if (error) {
            console.log(error)
            return null
        } else {
            return data[0].id
        }
    }catch(err) {
        console.log(err)
        return null
    }

}
const addCompanyDeveloper = async (companyID:string,developerID:string) => {
    try {
        const { data, error } = await supabase
        .from('company_developer')
        .upsert({ 
            company_id: companyID,
            developer_owner_id: developerID
         })
        .select()
        if (error) {
            console.log({error})
            return null
        } else {
            return data[0].id
        }
    }catch(err) {
        console.log(err)
        return null
    }

}