import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { OrderStatusEnum, PaymentEnumType } from 'src/common/enums/order.enum';
import { ICoupon } from './coupon.interface';
import { IProduct } from './product.interface';



export interface IOrderProduct {
  _id?: Types.ObjectId;
    productId:Types.ObjectId|IProduct;
    quantity:number;
   unitPrice:number;
   finalPrice:number;

  createdAt?: Date;
  updatedAt?: Date;

}

export interface IOrder  {
  _id?: Types.ObjectId;
  orderId:string;

createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  address:string;
  phone:string;
  note?:string;
  cancelReason?:string;
  status:OrderStatusEnum;
  payment:PaymentEnumType;
  intentId?:string;

  coupon?:Types.ObjectId|ICoupon;
  discount?:number;
  total:number;
  subTotal:number;
  

  paidAt?:Date;
  paymentIntent?:string;

  products:IOrderProduct[];

  createdAt?: Date;
  updatedAt?: Date;

  
  freezedAt?: Date;
  restoredAt?: Date;
}

