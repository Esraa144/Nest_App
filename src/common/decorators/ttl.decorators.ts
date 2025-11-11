import { SetMetadata } from "@nestjs/common"

export const TTLNAME='TTLNAME'
export const TTL = (expires:number)=>{
    return SetMetadata(TTLNAME,expires);
}