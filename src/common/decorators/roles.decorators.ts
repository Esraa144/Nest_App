import { SetMetadata } from "@nestjs/common"
import { RoleEnum } from "../enums"

export const roleName='tokenType'
export const Roles = (accessRoles:RoleEnum[])=>{
    return SetMetadata(roleName,accessRoles);
}