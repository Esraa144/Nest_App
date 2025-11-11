import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import { Category,  CategoryDocument as TDocument } from '../model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends DatabaseRepository<Category> {
  constructor(
    @InjectModel(Category.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
