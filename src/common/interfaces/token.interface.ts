import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from 'src/DB';
import { Types } from 'mongoose';
import { TokenEnum } from '../enums';
import { IUser } from './user.interface';



export interface IToken{
    _id?:Types.ObjectId;
    jti:string;
    expiredAt:Date;
    
    
    createdBy:Types.ObjectId|IUser;
  
    createdAt?:Date;
    updatedAt?:Date;
}
export interface ICredentials {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest extends Request {
  credential: ICredentials;
  tokenType?: TokenEnum;
}
