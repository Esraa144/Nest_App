import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import { Product,  ProductDocument as TDocument } from '../model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductRepository extends DatabaseRepository<Product> {
  constructor(
    @InjectModel(Product.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
