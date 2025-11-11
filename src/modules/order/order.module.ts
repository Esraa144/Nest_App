import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import {
  CartModel,
  CartRepository,
  CouponModel,
  CouponRepository,
  OrderModel,
  OrderRepository,
  ProductModel,
  ProductRepository,
} from 'src/DB';
import { CartService } from '../cart/cart.service';
import { PaymentService } from 'src/common';
import { RealTimeGateway } from '../gateway/gateway';

@Module({
  imports: [OrderModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    ProductRepository,
    OrderRepository,
    CartRepository,
    CouponRepository,
    CartService,
    PaymentService,
    RealTimeGateway
  ],
})
export class OrderModule {}
