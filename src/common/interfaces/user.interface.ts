import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB";
import { IProduct } from "./product.interface";

export interface IUser {
  _id?:Types.ObjectId;
  firstName: string;
  lastName: string;

  username?: string;
  email: string;
  confirmEmail?: Date;

  
  password?: string;

  provider: ProviderEnum;

  role: RoleEnum;

  gender: GenderEnum;

  preferredLanguage?: LanguageEnum;

  resetPasswordOtp?: string;

  changeCredentialsTime?: Date;

  otp?: OtpDocument[];

  profilePicture?:string;

  createdAt?:Date;
  updatedAt?:Date;
  wishlist?:Types.ObjectId[] |IProduct[];
}


export interface VerifiedGmailPayload {
  email: string;
  family_name: string;
  given_name: string;
  picture: string;
}