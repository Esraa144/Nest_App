import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  async checkoutSession({
    customer_email,
    cancel_url = process.env.CANCEL_URL as string,
    success_url = process.env.SUCCESS_URL as string,
    metadata = {},
    discounts = [],
    mode = 'payment',
    line_items,
  }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      cancel_url,
      success_url,
      metadata,
      discounts,
      mode,
      line_items,
    });
    return session;
  }

  async createCoupon(
    data: Stripe.CouponCreateParams,
  ): Promise<Stripe.Response<Stripe.Coupon>> {
    const coupon = await this.stripe.coupons.create(data);
    console.log({ coupon });
    return coupon;
  }

  async webhook(req: Request) {
    let event: Stripe.Event = this.stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_HOOK_SECRET as string,
    );
    if (event.type != 'checkout.session.completed') {
  throw new BadRequestException('Fail to pay')
  }
  console.log({event , metaData:event.data.object.metadata});
  
  return event
  }

  async createPaymentMethod(data:Stripe.PaymentMethodCreateParams):Promise<Stripe.Response<Stripe.PaymentMethod>>{
const method=await this.stripe.paymentMethods.create(data);
return method
  }

  async createPaymentIntent(data:Stripe.PaymentIntentCreateParams):Promise<Stripe.Response<Stripe.PaymentIntent>>{
const paymentIntent=await this.stripe.paymentIntents.create(data);
return paymentIntent
  }

  async retrievePaymentIntent(id:string):Promise<Stripe.Response<Stripe.PaymentIntent>>{
    const intent =await this.stripe.paymentIntents.retrieve(id)
    return intent;
  }

  async confirmPaymentIntent(id:string):Promise<Stripe.Response<Stripe.PaymentIntent>>{
    const intent = await this.retrievePaymentIntent(id)
    if (intent?.status != 'requires_confirmation') {
      throw new BadRequestException('Fail to Find Matching payment intent')
    }
    const confirm = await this.stripe.paymentIntents.confirm(id)
    console.log({confirm});
    
    return confirm;
  }

  async refund(id:string):Promise<Stripe.Response<Stripe.Refund>>{
    const intent = await this.retrievePaymentIntent(id)
    if (intent?.status != 'succeeded') {
      throw new BadRequestException('Fail to Find Matching payment intent')
    }
    const refund = await this.stripe.refunds.create({payment_intent:intent.id})
    console.log({refund});
    
    return refund;
  }

}