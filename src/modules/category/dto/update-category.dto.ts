import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

import { IsMongoId, IsOptional, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { ContainField, MongoDBIds } from 'src/common';

@ContainField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Validate(MongoDBIds)
  @IsOptional()
  removeBrands?: Types.ObjectId[];
}

export class CategoryParamsDto {
  @IsMongoId()
  CategoryId: Types.ObjectId;
}
