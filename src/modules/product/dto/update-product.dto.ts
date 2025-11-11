import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ContainField } from 'src/common';

@ContainField()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateProductAttachmentDto {
  @IsArray()
  @IsOptional()
  removedAttachments?: string[];
}
export class ProductParamDto {
  @IsMongoId()
  productId: Types.ObjectId;
}
