import { Response } from "express"
import supabase from "../utils/supabase"
import { TypedRequestBody } from "../types"

export const createDeveloper = async function (req: TypedRequestBody<{display_name: string}>, res: Response) {
    const displayName = req.body.display_name
    const devID = await addDeveloper(displayName)
    if(!devID) return res.sendStatus(500)
    const companyID = await addCompany(displayName)
    if(!companyID) return res.sendStatus(500)
    const companyDeveloperID = await addCompanyDeveloper(companyID,devID)
    if(!companyDeveloperID) return res.sendStatus(500)
    return res.send(devID)
}

async function addDeveloper(displayName:string):Promise<string | null>{
    try{
        const { data, error } = await supabase
        .from('developers')
        .upsert({ 
            display_name:displayName
        })
        .select()
        if (error) {
            console.log(error)
            return null;
        } else {
            return data[0].id
        }
    }
    catch(err){
        console.log(err)
        return null
    }
}
async function addCompany(displayName:string):Promise<string | null>{
    try{
        const { data, error } = await supabase
        .from('companies')
        .upsert({ 
            name:`${displayName} Co`
        })
        .select()
        if (error) {
            return null;
        } else {
            return data[0].id
        }
    }catch(err){
        return null
    }    
}
async function addCompanyDeveloper(companyID:string,developerID:string):Promise<string | null>{
    try{
        const { data, error } = await supabase
        .from('company_developer')
        .upsert({ 
            company_id:companyID,
            developer_owner_id:developerID
        })
        .select()
        if (error) {
            return null;
        } else {
            return data[0].id
        }
    }catch(err){
        return null
    }    
}
