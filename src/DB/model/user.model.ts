import {
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
  MongooseModule,
} from '@nestjs/mongoose';
import {
  GenderEnum,
  LanguageEnum,
  ProviderEnum,
  RoleEnum,
} from 'src/common/enums';
import { generateHash, IUser } from 'src/common';
import { HydratedDocument, Types } from 'mongoose';
import { OtpDocument } from './otp.model';
@Schema({
  strictQuery: true,
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User implements IUser {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 25,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 25,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: Date,
    required: false,
  })
  confirmEmail: Date;

  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === ProviderEnum.Google ? false : true;
    },
  })
  password: string;

  @Prop({ type: String, enum: ProviderEnum, default: ProviderEnum.System })
  provider: ProviderEnum;

  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
  role: RoleEnum;

  @Prop({ type: String, enum: GenderEnum, default: GenderEnum.male })
  gender: GenderEnum;

  @Prop({ type: String, enum: LanguageEnum, default: LanguageEnum.EN })
  preferredLanguage: LanguageEnum;

  @Prop({ type: String, required: false, default: null })
  resetPasswordOtp?: string;

  @Prop({
    type: Date,
  })
  changeCredentialsTime: Date;

  @Virtual()
  otp: OtpDocument[];

  @Prop({ type: String })
  profilePicture: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  wishlist?: Types.ObjectId[];
}

export type UserDocument = HydratedDocument<User>;
const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual('otp', {
  localField: '_id',
  foreignField: 'createdBy',
  ref: 'Otp',
});
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
  next();
});
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);

export const ConnectedSockets = new Map<string, string[]>();
