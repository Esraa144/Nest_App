import { Types } from 'mongoose';
import {
  OtpEnum,
} from '../enums';
import { IUser } from './user.interface';

export interface IOtp {
  _id?: Types.ObjectId;

  otp: string;
  expiredAt: Date;
  type: OtpEnum;

  createdBy: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}
