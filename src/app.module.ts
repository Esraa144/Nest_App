import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Service, SharedAuthenticationModule } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';
import { RealTimeModule } from './modules/gateway/gateway.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.development'),
      isGlobal: true,
    }),
    
// CacheModule.register({
//   ttl:5000,
//   isGlobal: true,
//    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CouponModule,
    OrderModule,
    RealTimeModule
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
