import { IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { Types } from "mongoose";
import {  ICategory, MongoDBIds } from "src/common";

export class CreateCategoryDto implements Partial<ICategory> {
    @MaxLength(25)
    @MinLength(2)
    @IsString()
    name:string;

 

    @MaxLength(5000)
    @MinLength(2)
    @IsString()
    @IsOptional()
    description:string;

  @Validate(MongoDBIds)
  @IsOptional()
    brands?: Types.ObjectId[];
}
