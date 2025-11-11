import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { Validate } from 'class-validator';
import { MongoDBIds } from 'src/common';

export class RemoveItemsFromCartDto {
  @Validate(MongoDBIds)
  productIds: Types.ObjectId[];
}
export class UpdateCartDto extends PartialType(CreateCartDto) {}
