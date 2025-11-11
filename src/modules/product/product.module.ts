import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandModel, BrandRepository, CategoryModel, CategoryRepository, ProductModel, ProductRepository } from 'src/DB';
import { S3Service } from 'src/common';

@Module({
  imports:[CategoryModel,ProductModel,BrandModel],
  controllers: [ProductController],
  providers: [ProductService,ProductRepository,BrandRepository,CategoryRepository,S3Service],
})
export class ProductModule {}
