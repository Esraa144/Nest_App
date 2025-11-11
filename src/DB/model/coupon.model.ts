import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import {  ICoupon } from 'src/common';
import { CouponEnum } from 'src/common/enums/coupon.enum';

@Schema({ timestamps: true, strictQuery: true })
export class Coupon implements ICoupon {
  @Prop({ type: String, required: true })
  image: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 25,
  })
  name: string;

  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  usedBy: Types.ObjectId[];

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, required: true })
  discount: number;
  @Prop({ type: Number, default: 1 })
  duration: number;
  @Prop({ type: String, enum: CouponEnum, default: CouponEnum.Percent })
  type: CouponEnum;

  @Prop({ type: Date })
  freezedAt?: Date;

  @Prop({ type: Date })
  restoredAt?: Date;
}

export type CouponDocument = HydratedDocument<Coupon>;
const couponSchema = SchemaFactory.createForClass(Coupon);

couponSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

couponSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

couponSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<CouponDocument>;
  if (update.name) {
    this.setUpdate({ ...update, slug: slugify(update.name) });
  }
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

couponSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
